import { Range } from 'vscode-languageserver';

import { Snapshot } from '../core/snapshot';
import { PerformanceHelper } from '../helper/performance-helper';
import { ElementRange } from '../interface/element-range';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { MacroArguments } from '../interface/macro/macro-arguments';
import { MacroContext } from '../interface/macro/macro-context';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { TextEdit } from '../interface/text-edit';
import { preprocessDshl } from './dshl-preprocessor';
import { preprocessHlsl } from './hlsl-preprocessor';
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
        const textEdits: TextEdit[] = [];
        let regexResult: RegExpExecArray | null;
        const regex = /\\\r?\n/g;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            textEdits.push({
                position,
                beforeEndPosition,
                pasteText: '',
            });
        }
        Preprocessor.executeTextEdits(textEdits, this.snapshot);
    }

    private preprocessComments(): void {
        const textEdits: TextEdit[] = [];
        const regex =
            /"(?:[^"]|\\")*"|(?<=#[ \t]*include[ \t]*)<[^>]*>|(?<error>(?<=#[ \t]*error).*)|'(?:[^']|\\')*'|(?<singleLineComment>\/\/.*)|(?<multiLineComment>\/\*[\s\S*]*?\*\/)/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const isNewLineAtTheEnd = regexResult.groups?.singleLineComment || regexResult.groups?.error;
            const originalRange = this.snapshot.getOriginalRange(
                position + 1,
                beforeEndPosition - (isNewLineAtTheEnd ? 0 : 1)
            );
            this.snapshot.noCodeCompletionRanges.push(originalRange);
            const isComment = regexResult.groups?.singleLineComment || regexResult.groups?.multiLineComment;
            if (isComment) {
                textEdits.push({
                    position,
                    beforeEndPosition,
                    pasteText: ' ',
                });
            } else {
                const sr: ElementRange = {
                    startPosition: position,
                    endPosition: beforeEndPosition,
                };
                this.snapshot.stringRanges.push(sr);
            }
        }
        Preprocessor.executeTextEdits(textEdits, this.snapshot);
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
        snapshot.text = snapshot.text.substring(0, position) + pasteText + snapshot.text.substring(beforeEndPosition);
    }

    public static changeTextAndAddOffset(
        position: number,
        beforeEndPosition: number,
        afterEndPosition: number,
        pasteText: string,
        snapshot: Snapshot
    ): void {
        Preprocessor.addPreprocessingOffset(position, beforeEndPosition, afterEndPosition, snapshot);
        Preprocessor.changeText(position, beforeEndPosition, pasteText, snapshot);
    }

    public static removeTextAndAddOffset(position: number, beforeEndPosition: number, snapshot: Snapshot): void {
        Preprocessor.changeTextAndAddOffset(position, beforeEndPosition, position, '', snapshot);
    }

    public static executeTextEdits(textEdits: TextEdit[], snapshot: Snapshot): void {
        let offset = 0;
        for (const te of textEdits) {
            te.position += offset;
            te.beforeEndPosition += offset;
            const afterEndPosition = te.position + te.pasteText.length;
            Preprocessor.changeTextAndAddOffset(
                te.position,
                te.beforeEndPosition,
                afterEndPosition,
                te.pasteText,
                snapshot
            );
            offset += te.pasteText.length - (te.beforeEndPosition - te.position);
        }
    }

    public static createIncludeStatement(
        beforeEndPosition: number,
        type: IncludeType,
        path: string,
        parentMc: MacroContext | null,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): IncludeStatement {
        const pathOriginalRange = Preprocessor.getIncludePathOriginalRange(beforeEndPosition, path, snapshot);
        const originalEndPosition = snapshot.getOriginalPosition(beforeEndPosition);
        const is: IncludeStatement = {
            path,
            pathOriginalRange,
            originalEndPosition,
            type,
            includerUri: parentIc?.snapshot?.uri ?? snapshot.uri,
        };
        if (!parentMc && !parentIc) {
            snapshot.includeStatements.push(is);
        }
        return is;
    }

    public static getIncludePathOriginalRange(beforeEndPosition: number, path: string, snapshot: Snapshot): Range {
        const pathEndPosition = beforeEndPosition - 1;
        const pathStartPosition = pathEndPosition - path.length;
        return snapshot.getOriginalRange(pathStartPosition, pathEndPosition);
    }

    public static addStringRanges(startPosition: number, endPosition: number, snapshot: Snapshot): void {
        const regex = /"(?:[^"]|\\")*"|(?<=#[ \t]*include[ \t]*)<[^>]*>|(?<=#[ \t]*error).*|'(?:[^']|\\')*'/g;
        let regexResult: RegExpExecArray | null;
        const text = snapshot.text.substring(startPosition, endPosition);
        while ((regexResult = regex.exec(text))) {
            const position = startPosition + regexResult.index;
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
        return snapshot.stringRanges.some((sr) => sr.startPosition <= position && position < sr.endPosition);
    }

    public static getMacroArguments(identifierEndPosition: number, snapshot: Snapshot): MacroArguments | null {
        const map = new MacroArgumentsProcesor(snapshot);
        return map.getMacroArguments(identifierEndPosition);
    }
}
