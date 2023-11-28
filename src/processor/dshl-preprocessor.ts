import { Snapshot } from '../core/snapshot';
import { IncludeStatement } from '../interface/include-statement';
import { IncludeType } from '../interface/include-type';
import { MacroContext } from '../interface/macro-context';
import { MacroParameters } from '../interface/macro-parameters';
import { MacroStatement } from '../interface/macro-statement';
import {
    addPreprocessingOffset,
    changeText,
    preprocessIncludeStatement,
} from './preprocessor';

export async function preprocessDshl(snapshot: Snapshot): Promise<void> {
    return await new DshlPreprocessor(snapshot).preprocess();
}

class DshlPreprocessor {
    private snapshot: Snapshot;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
    }

    public async preprocess(): Promise<void> {
        await this.preprocessIncludes();
        await this.preprocessMacros();
        this.removeIncompleteDirectives();
        await this.expandMacros();
    }

    private async preprocessIncludes(): Promise<void> {
        const regex = /(?<=([^#]|^)\s*)\binclude(_optional)?\s*"(?<path>.*?)"/;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const path = regexResult.groups?.path ?? '';
            const parentIc = this.snapshot.includeContextAt(position);

            const endPosition = regexResult.index + match.length - 1;
            const startPosition = endPosition - path.length;
            const range = this.snapshot.getOriginalRange(
                startPosition,
                endPosition
            );
            const is: IncludeStatement = {
                name: path,
                originalRange: range,
                type: IncludeType.DSHL,
                includerUri: parentIc?.uri ?? this.snapshot.uri,
            };
            if (!parentIc) {
                this.snapshot.includeStatements.push(is);
            }

            await preprocessIncludeStatement(
                position,
                beforeEndPosition,
                is,
                parentIc,
                this.snapshot
            );
        }
    }

    private async preprocessMacros(): Promise<void> {
        const regex =
            /(define_macro_if_not_defined|macro)\s+(?<name>[a-zA-Z_]\w*)\s*\((?<params>(\s*[a-zA-Z_]\w*\s*(,\s*[a-zA-Z_]\w*\s*)*(,\s*)?)?)\s*\)\n?(?<content>(.|\n)*?)\n?endmacro/;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            addPreprocessingOffset(
                position,
                beforeEndPosition,
                position,
                this.snapshot
            );
            changeText(position, beforeEndPosition, '', this.snapshot);
            const name = regexResult.groups?.name ?? '';
            if (
                match.startsWith('define_macro_if_not_defined') &&
                this.snapshot.macroStatements.some(
                    //TODO: do we need this?
                    (ms) => ms.name === name && ms.position < position
                )
            ) {
                return;
            }
            const ms: MacroStatement = {
                position,
                name,
                parameters:
                    regexResult.groups?.params
                        ?.replace(/\s/g, '')
                        .split(',')
                        .filter((p) => p.length) ?? [],
                content: regexResult.groups?.content ?? '',
            };
            this.snapshot.macroStatements.push(ms);
        }
    }

    private removeIncompleteDirectives(): void {
        const regex =
            /(?<=(^|\n))[^\S\n]*(include|endmacro|macro|##)\b.*?(?=(\n|$))/;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            addPreprocessingOffset(
                position,
                beforeEndPosition,
                position,
                this.snapshot
            );
            changeText(position, beforeEndPosition, '', this.snapshot);
        }
    }

    private async expandMacros(): Promise<void> {
        if (!this.snapshot.macroStatements.length) {
            return;
        }
        const macroNames = this.snapshot.macroStatements
            .map((ms) => ms.name)
            .join('|');
        const regex = new RegExp(`\\b(${macroNames})\\b`);
        let regexResult: RegExpExecArray | null;
        let referencePosition = 0;
        while (
            (regexResult = regex.exec(
                this.snapshot.text.substring(referencePosition)
            ))
        ) {
            const position = regexResult.index + referencePosition;
            const match = regexResult[0];
            referencePosition = position + match.length;

            const ms = this.getMacroStatement(match, position);
            if (!ms) {
                continue;
            }
            const mp = this.getMacroParameters(referencePosition);
            if (!mp || ms.parameters.length !== mp.parameters.length) {
                continue;
            }

            const beforeEndPosition = mp.endPosition;
            const pasteText = this.getMacroPasteText(ms, mp);
            const afterEndPosition = position + pasteText.length;
            addPreprocessingOffset(
                position,
                beforeEndPosition,
                afterEndPosition,
                this.snapshot
            );
            changeText(position, beforeEndPosition, pasteText, this.snapshot);
            referencePosition = position;
            const mc: MacroContext = {
                startPosition: position,
                endPosition: afterEndPosition,
            };
            this.snapshot.macroContexts.push(mc);
        }
    }

    private getMacroStatement(
        name: string,
        position: number
    ): MacroStatement | null {
        return (
            this.snapshot.macroStatements.find(
                (ms) => ms.name === name && ms.position <= position
            ) ?? null
        );
    }

    private getMacroParameters(position: number): MacroParameters | null {
        let rounded = 0;
        let curly = 0;
        let square = 0;
        let angular = 0;
        let parameterPosition = -1;
        let insideParameters = false;
        const parameters: string[] = [];
        for (let i = position; i < this.snapshot.text.length; i++) {
            const charactor = this.snapshot.text[i];
            if (charactor === ' ' || charactor === '\t' || charactor === '\n') {
                continue;
            }
            if (!insideParameters && charactor === '(') {
                insideParameters = true;
                parameterPosition = i + 1;
                continue;
            }
            if (!insideParameters) {
                return null;
            }
            if (insideParameters) {
                if (charactor === '(') {
                    rounded++;
                } else if (charactor === ')') {
                    if (
                        rounded === 0 &&
                        curly === 0 &&
                        square === 0 &&
                        angular === 0
                    ) {
                        if (parameterPosition !== -1) {
                            const parameter = this.snapshot.text
                                .substring(parameterPosition, i)
                                .trim();
                            if (parameter) {
                                parameters.push(parameter);
                            }
                        }
                        return { endPosition: i + 1, parameters };
                    }
                    rounded--;
                } else if (charactor === '{') {
                    curly++;
                } else if (charactor === '}') {
                    curly--;
                } else if (charactor === '[') {
                    square++;
                } else if (charactor === ']') {
                    square--;
                } else if (charactor === '<') {
                    angular++;
                } else if (charactor === '>') {
                    angular--;
                }

                if (
                    rounded === 0 &&
                    curly === 0 &&
                    square === 0 &&
                    angular === 0 &&
                    charactor === ','
                ) {
                    if (parameterPosition !== -1) {
                        const parameter = this.snapshot.text
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

    private getMacroPasteText(ms: MacroStatement, me: MacroParameters): string {
        let result = ms.content;
        for (let i = 0; i < ms.parameters.length; i++) {
            const parameterName = ms.parameters[i];
            const parameterValue = me.parameters[i];
            const regex = new RegExp(`\\b${parameterName}\\b`, 'g');
            result = result.replace(regex, parameterValue);
        }
        return result;
    }
}
