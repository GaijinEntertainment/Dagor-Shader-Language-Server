import { DocumentUri } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { getSnapshot } from '../core/document-manager';
import { Snapshot } from '../core/snapshot';
import { loadFile } from '../helper/fs-helper';
import { IncludeContext } from '../interface/include-context';
import { IncludeStatement } from '../interface/include-statement';
import { IncludeType } from '../interface/include-type';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { getIncludedDocumentUri } from './include-resolver';

export async function preprocess(snapshot: Snapshot): Promise<void> {
    return await new Preprocessor(snapshot).preprocess();
}

class Preprocessor {
    private snapshot: Snapshot;
    private text: string;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
        this.text = snapshot.originalText;
    }

    public async preprocess(): Promise<void> {
        this.clean();
        await this.preprocessDirectives();
        this.snapshot.preprocessedText = this.text;
    }

    private clean(): void {
        this.preprocessNewLines();
        this.preprocessLineContinuations();
        this.preprocessComments();
        this.snapshot.cleanedText = this.text;
    }

    private preprocessNewLines(): void {
        this.preprocessRegex(/\r(?=\n)/);
    }

    private preprocessLineContinuations(): void {
        this.preprocessRegex(/\\\n/);
    }

    private preprocessComments(): void {
        this.preprocessRegex(/\/\*(.|\n)*?\*\/|\/\/.*?(?=\n|$)/, ' ');
    }

    private preprocessRegex(regex: RegExp, pasteText = ''): void {
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const afterEndPosition = position + pasteText.length;
            this.addPreprocessingOffset(
                position,
                beforeEndPosition,
                afterEndPosition
            );
            this.changeText(position, beforeEndPosition, pasteText);
        }
    }

    private async preprocessDirectives(): Promise<void> {
        const regex = /#.*?(?=\n|$)|\binclude(_optional)?\s*".*?"/;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            await this.preprocessDirective(position, beforeEndPosition, match);
        }
    }

    private async getIncludeText(
        uri: DocumentUri | null,
        parentIc: IncludeContext | null
    ): Promise<string> {
        const circularInclude = this.isCircularInclude(parentIc, uri);
        return uri && !circularInclude ? await this.getText(uri) : '';
    }

    private isCircularInclude(
        ic: IncludeContext | null,
        uri: DocumentUri | null
    ): boolean {
        if (this.snapshot.uri === uri) {
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

    private addPreprocessingOffset(
        position: number,
        beforeEndPosition: number,
        afterEndPosition: number
    ): void {
        const po: PreprocessingOffset = {
            position,
            beforeEndPosition,
            afterEndPosition,
            offset: afterEndPosition - beforeEndPosition,
        };
        this.snapshot.addPreprocessingOffset(po);
    }

    private addIncludeContext(
        position: number,
        afterEndPosition: number,
        uri: DocumentUri | null,
        parentIc: IncludeContext | null
    ): void {
        if (!uri) {
            return;
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
            this.snapshot.includeContexts.push(ic);
        }
    }

    private changeText(
        position: number,
        beforeEndPosition: number,
        pasteText: string
    ): void {
        this.text =
            this.text.substring(0, position) +
            pasteText +
            this.text.substring(beforeEndPosition);
    }

    private async preprocessDirective(
        position: number,
        beforeEndPosition: number,
        match: string
    ): Promise<void> {
        const parentIc = this.snapshot.includeContextAt(position);
        const is = this.getIncludeStatement(match, position, parentIc);
        if (is) {
            await this.preprocessIncludeStatement(
                position,
                beforeEndPosition,
                is,
                parentIc
            );
            return;
        }
        // TODO: #define, #undef, #if, #ifdef, #ifndef, #else, #elif, #endif
        this.preprocessOtherDirective(position, beforeEndPosition);
    }

    private async preprocessIncludeStatement(
        position: number,
        beforeEndPosition: number,
        is: IncludeStatement,
        parentIc: IncludeContext | null
    ): Promise<void> {
        const uri = await getIncludedDocumentUri(is);
        const includeText = await this.getIncludeText(uri, parentIc);
        const afterEndPosition = position + includeText.length;
        this.addPreprocessingOffset(
            position,
            beforeEndPosition,
            afterEndPosition
        );
        this.addIncludeContext(position, afterEndPosition, uri, parentIc);
        this.changeText(position, beforeEndPosition, includeText);
    }

    private async preprocessOtherDirective(
        position: number,
        beforeEndPosition: number
    ): Promise<void> {
        this.addPreprocessingOffset(position, beforeEndPosition, position);
        this.changeText(position, beforeEndPosition, '');
    }

    private getIncludeStatement(
        text: string,
        position: number,
        parentIc: IncludeContext | null
    ): IncludeStatement | null {
        let regex = /(?<=#\s*include\s*").*?(?=")/;
        let result = this.createIncludeStatement(
            regex,
            text,
            position,
            parentIc,
            IncludeType.HLSL_QUOTED
        );
        if (result) {
            return result;
        }
        regex = /(?<=#\s*include\s*<).*?(?=>)/;
        result = this.createIncludeStatement(
            regex,
            text,
            position,
            parentIc,
            IncludeType.HLSL_ANGULAR
        );
        if (result) {
            return result;
        }
        regex = /(?<=include(_optional)?\s*").*?(?=")/;
        result = this.createIncludeStatement(
            regex,
            text,
            position,
            parentIc,
            IncludeType.DAGORSH
        );
        if (result) {
            return result;
        }
        return null;
    }

    private createIncludeStatement(
        regex: RegExp,
        text: string,
        position: number,
        parentIc: IncludeContext | null,
        type: IncludeType
    ): IncludeStatement | null {
        const regexResult = regex.exec(text);
        if (regexResult) {
            const match = regexResult[0];
            const startPosition = position + regexResult.index;
            const endPosition = position + regexResult.index + match.length;
            const range = this.snapshot.getOriginalRange(
                startPosition,
                endPosition
            );
            const is: IncludeStatement = {
                name: match,
                originalRange: range,
                type,
                includerUri: parentIc?.uri ?? this.snapshot.uri,
            };
            if (!parentIc) {
                this.snapshot.includeStatements.push(is);
            }
            return is;
        }
        return null;
    }

    private async getText(uri: DocumentUri): Promise<string> {
        let includedSnapshot = await getSnapshot(uri);
        if (includedSnapshot) {
            return includedSnapshot.cleanedText;
        } else {
            const text = await loadFile(URI.parse(uri).fsPath);
            includedSnapshot = new Snapshot(-1, uri, text);
            new Preprocessor(includedSnapshot).clean();
            return includedSnapshot.cleanedText;
        }
    }
}
