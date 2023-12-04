import { Snapshot } from '../core/snapshot';
import { PerformanceHelper } from '../helper/performance-helper';
import { IncludeStatement } from '../interface/include-statement';
import { IncludeType } from '../interface/include-type';
import { MacroContext } from '../interface/macro-context';
import { MacroParameters } from '../interface/macro-parameters';
import { MacroStatement } from '../interface/macro-statement';
import { StringRange } from '../interface/string-range';
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
    private stringPositions: StringRange[] = [];

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
    }

    public async preprocess(): Promise<void> {
        const ph = new PerformanceHelper();

        ph.start('preprocessIncludes');
        await this.preprocessIncludes();
        ph.end('preprocessIncludes');

        ph.start('preprocessMacros');
        await this.preprocessMacros();
        ph.end('preprocessMacros');

        ph.start('removeIncompleteDirectives');
        this.removeIncompleteDirectives();
        ph.end('removeIncompleteDirectives');

        ph.start('expandMacros');
        await this.expandMacros();
        ph.end('expandMacros');

        ph.log('expanding includes', 'preprocessIncludes');
        ph.log('finding macros', 'preprocessMacros');
        ph.log('removing other directives', 'removeIncompleteDirectives');
        ph.log('expanding macros', 'expandMacros');
    }

    private async preprocessIncludes(): Promise<void> {
        const regex =
            /(?<=(\n|^)[^#]*?)\binclude(_optional)?\s*?"(?<path>[^"]*?)"/g;
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
            regex.lastIndex = position;
        }
    }

    private async preprocessMacros(): Promise<void> {
        const regex =
            /(?<beforeContent>(define_macro_if_not_defined|macro)\s+?(?<name>[a-zA-Z_]\w*?)\s*?\((?<params>(\s*?[a-zA-Z_]\w*?\s*?(,\s*?[a-zA-Z_]\w*?\s*?)*?(,\s*?)?)?)\s*?\)\n?)(?<content>(.|\n)*?)\n?endmacro/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;

            const name = regexResult.groups?.name ?? '';
            const content = regexResult.groups?.content ?? '';
            this.addIncludesInMacro(
                content,
                position + (regexResult.groups?.beforeContent?.length ?? 0)
            );
            addPreprocessingOffset(
                position,
                beforeEndPosition,
                position,
                this.snapshot
            );
            changeText(position, beforeEndPosition, '', this.snapshot);
            regex.lastIndex = position;

            if (
                match.startsWith('define_macro_if_not_defined') &&
                this.snapshot.macroStatements.some(
                    //TODO: do we need this?
                    (ms) => ms.name === name && ms.position < position
                )
            ) {
                continue;
            }
            const ms: MacroStatement = {
                position,
                name,
                parameters:
                    regexResult.groups?.params
                        ?.replace(/\s/g, '')
                        .split(',')
                        .filter((p) => p.length) ?? [],
                content,
            };
            this.snapshot.macroStatements.push(ms);
        }
    }

    private addIncludesInMacro(text: string, position: number): void {
        const regex =
            /(?<=#\s*?include\s*?)("(?<c1>[^"]+?)"|<(?<c2>[^>]+?)>)(?=\n|$)/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(text))) {
            if (regexResult.groups) {
                if (regexResult.groups.c1) {
                    this.addInclude(
                        IncludeType.HLSL_QUOTED,
                        regexResult.groups.c1,
                        position + regexResult.index + 1
                    );
                } else if (regexResult.groups.c2) {
                    this.addInclude(
                        IncludeType.HLSL_ANGULAR,
                        regexResult.groups.c2,
                        position + regexResult.index + 1
                    );
                }
            }
        }
    }

    private addInclude(
        type: IncludeType,
        text: string,
        position: number
    ): void {
        const parentIc = this.snapshot.includeContextAt(position);
        const startPosition = position;
        const endPosition = position + text.length;
        const range = this.snapshot.getOriginalRange(
            startPosition,
            endPosition
        );
        const is: IncludeStatement = {
            name: text,
            originalRange: range,
            type,
            includerUri: parentIc?.uri ?? this.snapshot.uri,
        };
        const mc = this.snapshot.macroContexts.find(
            (me) => me.startPosition <= position && position <= me.endPosition
        );
        if (!parentIc && !mc) {
            this.snapshot.includeStatements.push(is);
        }
    }

    private removeIncompleteDirectives(): void {
        const regex =
            /(?<=(^|\n))[^\S\n]*?(include|endmacro|macro|##)\b.*?(?=(\n|$))/g;
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
            regex.lastIndex = position;
        }
    }

    private async expandMacros(): Promise<void> {
        if (!this.snapshot.macroStatements.length) {
            return;
        }
        const macroNames = this.snapshot.macroStatements
            .map((ms) => ms.name)
            .join('|');
        const regex = new RegExp(`\\b(${macroNames})\\b`, 'g');
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            regex.lastIndex = position + match.length;

            const ms = this.getMacroStatement(match, position);
            if (!ms) {
                continue;
            }
            const mp = this.getMacroParameters(regex.lastIndex);
            if (!mp || ms.parameters.length !== mp.parameters.length) {
                continue;
            }
            const parentMc = this.snapshot.macroContextAt(position);
            if (this.isCircularMacroExpansion(parentMc, ms)) {
                continue;
            }
            const beforeEndPosition = mp.endPosition;
            this.updateStringLiterals(beforeEndPosition);
            if (
                this.stringPositions.some(
                    (sr) =>
                        sr.startPosition <= position &&
                        position <= sr.endPosition
                )
            ) {
                continue;
            }

            const pasteText = this.getMacroPasteText(ms, mp);
            const afterEndPosition = position + pasteText.length;
            addPreprocessingOffset(
                position,
                beforeEndPosition,
                afterEndPosition,
                this.snapshot
            );
            changeText(position, beforeEndPosition, pasteText, this.snapshot);
            regex.lastIndex = position;
            const mc: MacroContext = {
                macro: ms,
                startPosition: position,
                endPosition: afterEndPosition,
                parent: null,
                children: [],
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

    private updateStringLiterals(limitPosition: number): void {
        this.stringPositions = [];
        const regex =
            /(?<=#\s*error).*?(?=\n|$)|(?<=#\s*include\s*<)[^>]*?(?=>)|(?<=")[^"]*?(?=")/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const endPosition = position + match.length;
            const sr: StringRange = {
                startPosition: position,
                endPosition: endPosition,
            };
            this.stringPositions.push(sr);
            if (position > limitPosition) {
                return;
            }
        }
    }

    private isCircularMacroExpansion(
        mc: MacroContext | null,
        ms: MacroStatement | null
    ): boolean {
        let currentMc: MacroContext | null = mc;
        while (currentMc) {
            if (currentMc.macro === ms) {
                return true;
            }
            currentMc = currentMc.parent;
        }
        return false;
    }
}
