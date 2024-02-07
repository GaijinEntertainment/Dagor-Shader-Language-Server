import { DocumentUri, Range } from 'vscode-languageserver';

import { URI } from 'vscode-uri';
import { DSHL_EXTENSION } from '../core/constant';
import { getFileContent, getFileVersion } from '../core/file-cache-manager';
import { Snapshot } from '../core/snapshot';
import { getDocuments } from '../helper/server-helper';
import { ElementRange } from '../interface/element-range';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { MacroArguments } from '../interface/macro/macro-arguments';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { invalidVersion } from '../interface/snapshot-version';
import { TextEdit } from '../interface/text-edit';
import { preprocessDshl } from './dshl-preprocessor';
import { preprocessHlsl } from './hlsl-preprocessor';
import { MacroArgumentsProcesor } from './macro-arguments-processor';

export async function preprocess(snapshot: Snapshot): Promise<void> {
    return await new Preprocessor(snapshot).preprocess();
}

export class Preprocessor {
    private snapshot: Snapshot;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
        this.snapshot.text = this.snapshot.originalText;
    }

    public clean(): void {
        this.preprocessLineContinuations();
        this.preprocessComments();
        this.snapshot.cleanedText = this.snapshot.text;
    }

    public async preprocess(): Promise<void> {
        this.clean();
        if (this.snapshot.uri.endsWith(DSHL_EXTENSION)) {
            await preprocessDshl(this.snapshot);
        }
        await preprocessHlsl(this.snapshot);
        this.snapshot.preprocessedText = this.snapshot.text;
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
                startPosition: position,
                endPosition: beforeEndPosition,
                newText: '',
            });
        }
        Preprocessor.executeTextEdits(textEdits, this.snapshot, false);
    }

    private preprocessComments(): void {
        const textEdits: TextEdit[] = [];
        const regex =
            /"(?:\\"|[^"])*"|(?<=#[ \t]*include[ \t]*)<[^>]*>|(?<error>(?<=#[ \t]*error).*)|'(?:[^']|\\')*'|(?<singleLineComment>\/\/.*)|(?<multiLineComment>\/\*[\s\S*]*?\*\/)/g;
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
                    startPosition: position,
                    endPosition: beforeEndPosition,
                    newText: ' ',
                });
            } else {
                const sr: ElementRange = {
                    startPosition: position,
                    endPosition: beforeEndPosition,
                };
                this.snapshot.stringRanges.push(sr);
            }
        }
        Preprocessor.executeTextEdits(textEdits, this.snapshot, false);
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

    public static executeTextEdits(textEdits: TextEdit[], snapshot: Snapshot, addStringRanges: boolean): void {
        if (!textEdits.length) {
            return;
        }
        let offset = 0;
        const result: string[] = [];
        const editRanges: ElementRange[] = [];
        textEdits = textEdits.sort((a, b) => a.startPosition - b.startPosition);
        for (let i = 0; i < textEdits.length; i++) {
            const textEdit = textEdits[i];
            const afterEndPosition = textEdit.startPosition + textEdit.newText.length;
            Preprocessor.addPreprocessingOffset(
                textEdit.startPosition + offset,
                textEdit.endPosition + offset,
                afterEndPosition + offset,
                snapshot
            );
            editRanges.push({
                startPosition: textEdit.startPosition + offset,
                endPosition: afterEndPosition + offset,
            });
            offset += textEdit.newText.length - (textEdit.endPosition - textEdit.startPosition);
            if (i === 0) {
                result.push(snapshot.text.substring(0, textEdit.startPosition));
            }
            result.push(textEdit.newText);
            if (i === textEdits.length - 1) {
                result.push(snapshot.text.substring(textEdit.endPosition));
            } else {
                result.push(snapshot.text.substring(textEdit.endPosition, textEdits[i + 1].startPosition));
            }
        }
        snapshot.text = result.join('');
        if (addStringRanges) {
            for (const er of editRanges) {
                Preprocessor.addStringRanges(er.startPosition, er.endPosition, snapshot);
            }
        }
    }

    public static createIncludeStatement(
        beforeEndPosition: number,
        type: IncludeType,
        path: string,
        mc: boolean,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): IncludeStatement {
        const pathOriginalRange = Preprocessor.getIncludePathOriginalRange(beforeEndPosition, path, snapshot);
        const originalEndPosition = snapshot.getOriginalPosition(beforeEndPosition, false);
        const is: IncludeStatement = {
            path,
            pathOriginalRange,
            originalEndPosition,
            type,
            includerUri: parentIc?.snapshot?.uri ?? snapshot.uri,
        };
        if (!mc && !parentIc) {
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
        const regex = /"(?:\\"|[^"])*"|(?<=#[ \t]*include[ \t]*)<[^>]*>|(?<=#[ \t]*error).*|'(?:[^']|\\')*'/g;
        let regexResult: RegExpExecArray | null;
        const text = snapshot.text.substring(startPosition, endPosition);
        while ((regexResult = regex.exec(text))) {
            const position = startPosition + regexResult.index;
            const match = regexResult[0];
            const endPosition = position + match.length;
            const sr: ElementRange = {
                startPosition: position,
                endPosition,
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

    public static async getSnapshot(uri: DocumentUri, snapshot: Snapshot): Promise<Snapshot> {
        // TODO: make it more uniform with the file cache
        const document = getDocuments().get(uri);
        if (document) {
            snapshot.version.includedDocumentsVersion.set(uri, {
                version: document.version,
                isManaged: true,
            });
            return new Snapshot(invalidVersion, uri, document.getText());
        } else {
            const fsUri = URI.parse(uri).fsPath;
            const text = await getFileContent(fsUri);
            const cachedVersion = getFileVersion(fsUri);
            snapshot.version.includedDocumentsVersion.set(uri, {
                version: cachedVersion,
                isManaged: false,
            });
            return new Snapshot(invalidVersion, uri, text);
        }
    }
}
