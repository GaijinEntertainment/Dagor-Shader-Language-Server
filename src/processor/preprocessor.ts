import { DocumentUri } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { collectAndLogPerformance } from '../core/debug';
import { getSnapshot } from '../core/document-manager';
import { getFileContent } from '../core/file-cache-manager';
import { Snapshot } from '../core/snapshot';
import { PerformanceHelper } from '../helper/performance-helper';
import { ElementRange } from '../interface/element-range';
import { IncludeContext } from '../interface/include-context';
import { IncludeStatement } from '../interface/include-statement';
import { MacroArguments } from '../interface/macro-parameters';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { preprocessDshl } from './dshl-preprocessor';
import { preprocessHlsl } from './hlsl-preprocessor';
import { getIncludedDocumentUri } from './include-resolver';

export async function preprocess(snapshot: Snapshot): Promise<void> {
    return await new Preprocessor(snapshot).preprocess();
}

class Preprocessor {
    private snapshot: Snapshot;
    private ph: PerformanceHelper;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
        this.snapshot.text = this.snapshot.originalText;
        this.ph = new PerformanceHelper(this.snapshot.uri);
    }

    public clean(): void {
        this.preprocessNewLines();
        this.preprocessLineContinuations();
        this.preprocessComments();
        this.snapshot.cleanedText = this.snapshot.text;
    }

    private logPerformance(): void {
        if (!collectAndLogPerformance) {
            return;
        }
        this.ph.log('preprocessing', 'preprocess');
        this.ph.log('  global preprocessor', 'clean');
        this.ph.log('  DSHL preprocessor', 'DSHL');
        this.ph.log('  HLSL preprocessor', 'HLSL');
    }

    public async preprocess(): Promise<void> {
        this.ph.start('preprocess');
        this.ph.start('clean');
        this.clean();
        this.ph.end('clean');

        if (this.snapshot.uri.endsWith('.dshl')) {
            this.ph.start('DSHL');
            await preprocessDshl(this.snapshot);
            this.ph.end('DSHL');
        }

        this.ph.start('HLSL');
        await preprocessHlsl(this.snapshot);
        this.ph.end('HLSL');
        this.ph.end('preprocess');

        this.logPerformance();
        this.snapshot.preprocessedText = this.snapshot.text;
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
    snapshot.text = getChangedText(
        position,
        beforeEndPosition,
        pasteText,
        snapshot.text
    );
}

export function getChangedText(
    position: number,
    beforeEndPosition: number,
    pasteText: string,
    text: string
): string {
    return (
        text.substring(0, position) +
        pasteText +
        text.substring(beforeEndPosition)
    );
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
    return position;
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
        const text = await getFileContent(URI.parse(uri).fsPath);
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

export function getMacroArguments(
    identifierEndPosition: number,
    snapshot: Snapshot
): MacroArguments | null {
    let rounded = 0;
    let curly = 0;
    let square = 0;
    let angular = 0;
    let lastCharacterIsEscape = false;
    let stringLiteral = false;
    let characterLiteral = false;
    let parameterPosition = -1;
    let insideParameters = false;
    const parameters: string[] = [];
    for (let i = identifierEndPosition; i < snapshot.text.length; i++) {
        if (i !== 0) {
            lastCharacterIsEscape = snapshot.text[i - 1] === '\\';
        }
        const character = snapshot.text[i];
        if (character === ' ' || character === '\t' || character === '\n') {
            continue;
        }
        if (!insideParameters && character === '(') {
            insideParameters = true;
            parameterPosition = i + 1;
            continue;
        }
        if (!insideParameters) {
            return null;
        }
        if (insideParameters) {
            if (!stringLiteral && !characterLiteral) {
                if (character === '(') {
                    rounded++;
                } else if (character === ')') {
                    if (
                        rounded === 0 &&
                        curly === 0 &&
                        square === 0 &&
                        angular === 0
                    ) {
                        if (parameterPosition !== -1) {
                            const parameter = snapshot.text
                                .substring(parameterPosition, i)
                                .trim();
                            if (parameter) {
                                parameters.push(parameter);
                            }
                        }
                        return {
                            endPosition: i + 1,
                            arguments: parameters,
                        };
                    }
                    rounded--;
                } else if (character === '{') {
                    curly++;
                } else if (character === '}') {
                    curly--;
                } else if (character === '[') {
                    square++;
                } else if (character === ']') {
                    square--;
                } else if (character === '<') {
                    angular++;
                } else if (character === '>') {
                    angular--;
                }
            }
            if (character === '"' && !lastCharacterIsEscape) {
                stringLiteral = !stringLiteral;
            } else if (character === "'" && !lastCharacterIsEscape) {
                characterLiteral = !characterLiteral;
            }
            if (
                rounded === 0 &&
                curly === 0 &&
                square === 0 &&
                angular === 0 &&
                character === ','
            ) {
                if (parameterPosition !== -1) {
                    const parameter = snapshot.text
                        .substring(parameterPosition, i)
                        .trim();
                    if (parameter) {
                        parameters.push(parameter);
                    }
                }
                parameterPosition = i + 1;
            }
        }
    }
    return null;
}

export function getStringRanges(
    endPosition: number,
    text: string
): ElementRange[] {
    const stringPositions: ElementRange[] = [];
    const regex =
        /(?<=#\s*error).*?(?=\n|$)|(?<=#\s*include\s*<)[^>]*?(?=>)|"([^"]*?[^"\\])?"/g;
    let regexResult: RegExpExecArray | null;
    // regex.lastIndex = startPosition;
    const t = text.substring(0, endPosition + 1);
    while ((regexResult = regex.exec(t))) {
        const position = regexResult.index;
        const match = regexResult[0];
        const endPosition = position + match.length;
        const sr: ElementRange = {
            startPosition: position,
            endPosition: endPosition,
        };
        stringPositions.push(sr);
    }
    return stringPositions;
}
