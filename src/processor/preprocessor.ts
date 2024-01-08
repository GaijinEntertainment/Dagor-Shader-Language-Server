import { Range } from 'vscode-languageserver';

import { Snapshot } from '../core/snapshot';
import { PerformanceHelper } from '../helper/performance-helper';
import { ElementRange } from '../interface/element-range';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { MacroContext } from '../interface/macro/macro-context';
import { MacroArguments } from '../interface/macro/macro-parameters';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { preprocessDshl } from './dshl-preprocessor';
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
        // TODO
        // await preprocessHlsl(this.snapshot);
        this.snapshot.preprocessedText = this.snapshot.text;
        this.ph.end('preprocess');
        this.ph.log('preprocessing', 'preprocess');
    }

    private preprocessLineContinuations(): void {
        let regexResult: RegExpExecArray | null;
        const regex = /\\\r?\n/g;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const pasteText = '';
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

    private preprocessComments(): void {
        const regex =
            /"(?:[^"]|\\")*"|(?<=#[ \t]*include[ \t]*)<[^>]*>|(?<=#[ \t]*error).*|'(?:[^']|\\')*'|\/\/.*|\/\*[\s\S*]*?\*\//g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            if (match.startsWith('//') || match.startsWith('/*')) {
                const pasteText = ' ';
                const afterEndPosition = position + pasteText.length;
                Preprocessor.changeTextAndAddOffset(
                    position,
                    beforeEndPosition,
                    afterEndPosition,
                    pasteText,
                    this.snapshot
                );
                regex.lastIndex = afterEndPosition;
            } else {
                const sr: ElementRange = {
                    startPosition: position,
                    endPosition: beforeEndPosition,
                };
                this.snapshot.stringRanges.push(sr);
            }
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

    public static createIncludeStatement(
        beforeEndPosition: number,
        type: IncludeType,
        path: string,
        parentMc: MacroContext | null,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): IncludeStatement {
        const pathOriginalRange = Preprocessor.getIncludePathOriginalRange(
            beforeEndPosition,
            path,
            snapshot
        );
        const is: IncludeStatement = {
            path,
            pathOriginalRange,
            type,
            includerUri: parentIc?.snapshot?.uri ?? snapshot.uri,
        };
        if (!parentMc && !parentIc) {
            snapshot.includeStatements.push(is);
        }
        return is;
    }

    public static getIncludePathOriginalRange(
        beforeEndPosition: number,
        path: string,
        snapshot: Snapshot
    ): Range {
        const pathEndPosition = beforeEndPosition - 1;
        const pathStartPosition = pathEndPosition - path.length;
        return snapshot.getOriginalRange(pathStartPosition, pathEndPosition);
    }

    public static addStringRanges(
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
            (sr) => sr.startPosition <= position && position < sr.endPosition
        );
    }

    public static getMacroArguments(
        identifierEndPosition: number,
        snapshot: Snapshot
    ): MacroArguments | null {
        const map = new MacroArgumentsProcesor(snapshot.text);
        return map.getMacroArguments(identifierEndPosition);
    }
}
