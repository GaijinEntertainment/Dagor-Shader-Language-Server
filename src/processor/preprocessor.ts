import { DocumentUri } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { getSnapshot } from '../core/document-manager';
import { Snapshot } from '../core/snapshot';
import { loadFile } from '../helper/fs-helper';
import { IncludeContext } from '../interface/include-context';
import { IncludeStatement } from '../interface/include-statement';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { preprocessDshl } from './dshl-preprocessor';
import { preprocessHlsl } from './hlsl-preprocessor';
import { getIncludedDocumentUri } from './include-resolver';

export async function preprocess(snapshot: Snapshot): Promise<void> {
    return await new Preprocessor(snapshot).preprocess();
}
class Preprocessor {
    private snapshot: Snapshot;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
        this.snapshot.text = this.snapshot.originalText;
    }

    public async preprocess(): Promise<void> {
        this.clean();
        await preprocessDshl(this.snapshot);
        await preprocessHlsl(this.snapshot);
        this.snapshot.preprocessedText = this.snapshot.text;
    }

    public clean(): void {
        this.preprocessNewLines();
        this.preprocessLineContinuations();
        this.preprocessComments();
        this.snapshot.cleanedText = this.snapshot.text;
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
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const afterEndPosition = position + pasteText.length;
            addPreprocessingOffset(
                position,
                beforeEndPosition,
                afterEndPosition,
                this.snapshot
            );
            changeText(position, beforeEndPosition, pasteText, this.snapshot);
        }
    }
}

export function addPreprocessingOffset(
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

function addIncludeContext(
    position: number,
    afterEndPosition: number,
    uri: DocumentUri | null,
    parentIc: IncludeContext | null,
    snapshot: Snapshot
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
        snapshot.includeContexts.push(ic);
    }
}

export function changeText(
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

export async function preprocessIncludeStatement(
    position: number,
    beforeEndPosition: number,
    is: IncludeStatement,
    parentIc: IncludeContext | null,
    snapshot: Snapshot
): Promise<number> {
    const uri = await getIncludedDocumentUri(is);
    const includeText = await getIncludeText(uri, parentIc, snapshot);
    const afterEndPosition = position + includeText.length;
    addPreprocessingOffset(
        position,
        beforeEndPosition,
        afterEndPosition,
        snapshot
    );
    addIncludeContext(position, afterEndPosition, uri, parentIc, snapshot);
    changeText(position, beforeEndPosition, includeText, snapshot);
    return afterEndPosition;
}

async function getIncludeText(
    uri: DocumentUri | null,
    parentIc: IncludeContext | null,
    snapshot: Snapshot
): Promise<string> {
    const circularInclude = isCircularInclude(parentIc, uri, snapshot);
    return uri && !circularInclude ? await getText(uri) : '';
}

async function getText(uri: DocumentUri): Promise<string> {
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

function isCircularInclude(
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
