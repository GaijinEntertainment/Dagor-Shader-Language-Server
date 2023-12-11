import { DocumentUri, Range } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { getSnapshot } from '../core/document-manager';
import { getFileContent } from '../core/file-cache-manager';
import { Snapshot } from '../core/snapshot';
import { PerformanceHelper } from '../helper/performance-helper';
import { ElementRange } from '../interface/element-range';
import { IncludeContext } from '../interface/include-context';
import { IncludeStatement } from '../interface/include-statement';
import { IncludeType } from '../interface/include-type';
import { MacroContext } from '../interface/macro-context';
import { MacroArguments } from '../interface/macro-parameters';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { preprocessDshl } from './dshl-preprocessor';
import { preprocessHlsl } from './hlsl-preprocessor';
import { getIncludedDocumentUri } from './include-resolver';
import { MacroArgumentsProcesor } from './macro-arguments-processor';

export async function preprocess(snapshot: Snapshot): Promise<void> {
    return await new Preprocessor(snapshot).preprocess();
}

export class Preprocessor {
    private snapshot: Snapshot;
    private ph: PerformanceHelper;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
        this.snapshot.text = this.snapshot.originalText;
        this.ph = new PerformanceHelper(this.snapshot.uri);
    }

    public clean(): void {
        this.ph.start('clean');
        this.ph.start('preprocessLineContinuations');
        this.preprocessLineContinuations();
        this.ph.end('preprocessLineContinuations');
        this.ph.start('preprocessComments');
        this.preprocessComments();
        this.ph.end('preprocessComments');
        this.snapshot.cleanedText = this.snapshot.text;
        this.ph.end('clean');
    }

    public async preprocess(): Promise<void> {
        this.ph.start('preprocess');
        this.clean();
        this.ph.log('  general preprocessor', 'clean');
        this.ph.log('    line continuations', 'preprocessLineContinuations');
        this.ph.log('    comments', 'preprocessComments');
        if (this.snapshot.uri.endsWith('.dshl')) {
            await preprocessDshl(this.snapshot);
        }
        await preprocessHlsl(this.snapshot);
        this.snapshot.preprocessedText = this.snapshot.text;
        this.ph.end('preprocess');
        this.ph.log('preprocessing', 'preprocess');
    }

    private preprocessLineContinuations(): void {
        this.preprocessRegex(/\\\r?\n/g);
    }

    private preprocessComments(): void {
        this.preprocessRegex(/\/\/.*|\/\*[\s\S*]*?\*\//g, ' ');
    }

    private preprocessRegex(regex: RegExp, pasteText = ''): void {
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const afterEndPosition = position + pasteText.length;
            Preprocessor.changeTextAndAddOffset(
                position,
                beforeEndPosition,
                afterEndPosition,
                pasteText,
                this.snapshot
            );
            regex.lastIndex = afterEndPosition;
        }
    }

    private static addPreprocessingOffset(
        position: number,
        beforeEndPosition: number,
        afterEndPosition: number,
        snapshot: Snapshot
    ): void {
        const po: PreprocessingOffset = {
            position,
            beforeEndPosition,
            afterEndPosition,
            offset: afterEndPosition - beforeEndPosition,
        };
        snapshot.addPreprocessingOffset(po);
    }

    private static changeText(
        position: number,
        beforeEndPosition: number,
        pasteText: string,
        snapshot: Snapshot
    ): void {
        snapshot.text =
            snapshot.text.substring(0, position) +
            pasteText +
            snapshot.text.substring(beforeEndPosition);
    }

    public static changeTextAndAddOffset(
        position: number,
        beforeEndPosition: number,
        afterEndPosition: number,
        pasteText: string,
        snapshot: Snapshot
    ): void {
        Preprocessor.addPreprocessingOffset(
            position,
            beforeEndPosition,
            afterEndPosition,
            snapshot
        );
        Preprocessor.changeText(
            position,
            beforeEndPosition,
            pasteText,
            snapshot
        );
    }

    public static removeTextAndAddOffset(
        position: number,
        beforeEndPosition: number,
        snapshot: Snapshot
    ): void {
        Preprocessor.changeTextAndAddOffset(
            position,
            beforeEndPosition,
            position,
            '',
            snapshot
        );
    }

    public static async includeContent(
        position: number,
        beforeEndPosition: number,
        is: IncludeStatement,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): Promise<void> {
        const uri = await getIncludedDocumentUri(is);
        const includeText = await Preprocessor.getIncludeText(
            uri,
            parentIc,
            snapshot
        );
        const afterEndPosition = position + includeText.length;
        Preprocessor.changeTextAndAddOffset(
            position,
            beforeEndPosition,
            afterEndPosition,
            includeText,
            snapshot
        );
        const ic = Preprocessor.createIncludeContext(
            position,
            afterEndPosition,
            uri,
            parentIc,
            snapshot
        );
        if (ic) {
            Preprocessor.updateStringRanges(
                position,
                afterEndPosition,
                snapshot
            );
        }
    }

    private static createIncludeContext(
        position: number,
        afterEndPosition: number,
        uri: DocumentUri | null,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): IncludeContext | null {
        if (!uri) {
            return null;
        }
        const ic: IncludeContext = {
            startPosition: position,
            endPosition: afterEndPosition,
            uri,
            parent: parentIc,
            children: [],
        };
        if (parentIc) {
            parentIc.children.push(ic);
        } else {
            snapshot.includeContexts.push(ic);
        }
        return ic;
    }

    private static async getIncludeText(
        uri: DocumentUri | null,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): Promise<string> {
        const circularInclude = Preprocessor.isCircularInclude(
            parentIc,
            uri,
            snapshot
        );
        return uri && !circularInclude ? await Preprocessor.getText(uri) : '';
    }

    private static async getText(uri: DocumentUri): Promise<string> {
        let includedSnapshot = await getSnapshot(uri);
        if (includedSnapshot) {
            return includedSnapshot.cleanedText;
        } else {
            const text = await getFileContent(URI.parse(uri).fsPath);
            includedSnapshot = new Snapshot(-1, uri, text);
            new Preprocessor(includedSnapshot).clean();
            return includedSnapshot.cleanedText;
        }
    }

    private static isCircularInclude(
        ic: IncludeContext | null,
        uri: DocumentUri | null,
        snapshot: Snapshot
    ): boolean {
        if (snapshot.uri === uri) {
            return true;
        }
        let currentIc: IncludeContext | null = ic;
        while (currentIc) {
            if (currentIc.uri === uri) {
                return true;
            }
            currentIc = currentIc.parent;
        }
        return false;
    }

    public static updateStringRanges(
        startPosition: number,
        endPosition: number,
        snapshot: Snapshot
    ): void {
        const regex =
            /"(?:[^"]|\\")*"|(?<=#[ \t]*include[ \t]*)<[^>]*>|(?<=#[ \t]*error).*|'(?:[^']|\\')*'/g;
        let regexResult: RegExpExecArray | null;
        regex.lastIndex = startPosition;
        const text = snapshot.text.substring(0, endPosition);
        while ((regexResult = regex.exec(text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const endPosition = position + match.length;
            const sr: ElementRange = {
                startPosition: position,
                endPosition: endPosition,
            };
            snapshot.stringRanges.push(sr);
        }
    }

    public static isInString(position: number, snapshot: Snapshot): boolean {
        return snapshot.stringRanges.some(
            (sr) => sr.startPosition <= position && position <= sr.endPosition
        );
    }

    public static getMacroArguments(
        identifierEndPosition: number,
        snapshot: Snapshot
    ): MacroArguments | null {
        const map = new MacroArgumentsProcesor(snapshot.text);
        return map.getMacroArguments(identifierEndPosition);
    }

    public static createIncludeStatement(
        beforeEndPosition: number,
        type: IncludeType,
        path: string,
        parentMc: MacroContext | null,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): IncludeStatement {
        const pathOriginalRange = this.getIncludePathOriginalRange(
            beforeEndPosition,
            path,
            snapshot
        );
        const is: IncludeStatement = {
            path,
            pathOriginalRange,
            type,
            includerUri: parentIc?.uri ?? snapshot.uri,
        };
        if (!parentMc && !parentIc) {
            snapshot.includeStatements.push(is);
        }
        return is;
    }

    private static getIncludePathOriginalRange(
        beforeEndPosition: number,
        path: string,
        snapshot: Snapshot
    ): Range {
        const pathEndPosition = beforeEndPosition - 1;
        const pathStartPosition = pathEndPosition - path.length;
        return snapshot.getOriginalRange(pathStartPosition, pathEndPosition);
    }
}
