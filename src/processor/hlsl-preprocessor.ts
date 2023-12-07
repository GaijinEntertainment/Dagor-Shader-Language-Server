import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';

import { ConditionLexer } from '../_generated/ConditionLexer';
import { ConditionParser } from '../_generated/ConditionParser';
import { Snapshot } from '../core/snapshot';
import { DefineContext } from '../interface/define-context';
import { DefineStatement } from '../interface/define-statement';
import { ElementRange } from '../interface/element-range';
import { IfState } from '../interface/if-state';
import { IncludeContext } from '../interface/include-context';
import { IncludeStatement } from '../interface/include-statement';
import { IncludeType } from '../interface/include-type';
import { ConditionVisitor } from './condition-visitor';
import {
    addPreprocessingOffset,
    changeText,
    getChangedText,
    getMacroArguments,
    getStringRanges,
    preprocessIncludeStatement,
} from './preprocessor';

export async function preprocessHlsl(snapshot: Snapshot): Promise<void> {
    return await new HlslPreprocessor(snapshot).preprocess();
}

class HlslPreprocessor {
    private snapshot: Snapshot;
    private ifStack: IfState[] = [];
    private macroNames = '';

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
    }

    public async preprocess(): Promise<void> {
        const regex = /#.*?(?=\n|$)/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const x = await this.preprocessDirective(
                position,
                beforeEndPosition,
                match
            );
            regex.lastIndex = x; //position;
        }

        const mn = this.snapshot.defineStatements.map((ds) => ds.name);
        const umn = [...new Set(mn)];
        this.macroNames = umn.join('|');
        expandMacros(
            0,
            this.snapshot.text.length,
            this.snapshot,
            this.macroNames
        );
    }

    private async preprocessDirective(
        position: number,
        beforeEndPosition: number,
        match: string
    ): Promise<number> {
        const is2 = this.getIfdefStatement(match, position);
        if (is2) {
            this.ifStack.push(is2);
            this.removeSection(position, beforeEndPosition);
            return position;
        }
        const is4 = this.getIfStatement(match, position);
        if (is4) {
            this.ifStack.push(is4);
            this.removeSection(position, beforeEndPosition + is4.offset);
            return position;
        }
        const is5 = this.getElifStatement(match, position);
        if (is5) {
            const oldIs = this.ifStack.pop();
            if (oldIs && !oldIs.condition) {
                this.removeSection(
                    oldIs.position,
                    beforeEndPosition + is5.offset
                );
                this.ifStack.push(is5);
                return oldIs.position;
            } else {
                this.removeSection(position, beforeEndPosition + is5.offset);
                this.ifStack.push(is5);
                return position;
            }
        }
        const es = this.getElseStatement(match, position);
        if (es) {
            const oldIs = this.ifStack.pop();
            if (oldIs && !oldIs.condition) {
                this.removeSection(oldIs.position, beforeEndPosition);
                this.ifStack.push(es);
                return oldIs.position;
            } else {
                this.removeSection(position, beforeEndPosition);
                this.ifStack.push(es);
                return position;
            }
        }
        if (this.isEndifStatement(match)) {
            const is3 = this.ifStack.pop();
            if (is3 && !is3.condition) {
                this.removeSection(is3.position, beforeEndPosition);
                return is3.position;
            } else {
                this.removeSection(position, beforeEndPosition);
                return position;
            }
        }
        const parentIc = this.snapshot.includeContextAt(position);
        const is = this.getIncludeStatement(match, position, parentIc);
        if (is) {
            if (this.ifStack.every((is) => is.condition)) {
                await preprocessIncludeStatement(
                    position,
                    beforeEndPosition,
                    is,
                    parentIc,
                    this.snapshot
                );
            } else {
                this.removeSection(position, beforeEndPosition);
            }
            return position;
        }
        const ds = this.getDefineStatement(match, position);
        if (ds) {
            this.removeSection(position, beforeEndPosition);
            return position;
        }
        if (this.isUndefStatement(match, position)) {
            this.removeSection(position, beforeEndPosition);
            return position;
        }
        this.removeSection(position, beforeEndPosition);
        // TODO: find all strings
        return position;
    }

    private async removeSection(
        position: number,
        beforeEndPosition: number
    ): Promise<void> {
        addPreprocessingOffset(
            position,
            beforeEndPosition,
            position,
            this.snapshot
        );
        changeText(position, beforeEndPosition, '', this.snapshot);
    }

    private getIfStatement(text: string, position: number): IfState | null {
        const regex = /#\s*?if\b(?<condition>.*?)(?=\n|$)/;
        let regexResult = regex.exec(
            this.snapshot.text.substring(position, position + text.length)
        );
        if (regexResult) {
            const mn = this.snapshot.defineStatements.map((ds) => ds.name);
            const umn = [...new Set(mn)];
            this.macroNames = umn.join('|');
            const dcs = expandMacros(
                position + regexResult.index,
                position + regexResult.index + regexResult[0].length,
                this.snapshot,
                this.macroNames
            );
            const offset = dcs
                .map((dc) => dc.afterEndPosition - dc.beforeEndPosition)
                .reduce((prev, curr) => prev + curr, 0);
            regexResult = regex.exec(
                this.snapshot.text.substring(
                    position,
                    position + text.length + offset
                )
            );
            if (regexResult && regexResult.groups) {
                const condition = this.evaluateCondition(
                    regexResult.groups.condition,
                    position
                );
                const is: IfState = {
                    position: position,
                    condition,
                    already: condition,
                    offset,
                };
                return is;
            }
        }
        return null;
    }

    private getElifStatement(text: string, position: number): IfState | null {
        const regex = /#\s*?elif\b(?<condition>.*?)(?=\n|$)/;
        let regexResult = regex.exec(
            this.snapshot.text.substring(position, position + text.length)
        );
        if (regexResult) {
            const mn = this.snapshot.defineStatements.map((ds) => ds.name);
            const umn = [...new Set(mn)];
            this.macroNames = umn.join('|');
            const dcs = expandMacros(
                position + regexResult.index,
                position + regexResult.index + regexResult[0].length,
                this.snapshot,
                this.macroNames
            );
            const offset = dcs
                .map((dc) => dc.afterEndPosition - dc.beforeEndPosition)
                .reduce((prev, curr) => prev + curr, 0);
            regexResult = regex.exec(
                this.snapshot.text.substring(
                    position,
                    position + text.length + offset
                )
            );
            if (regexResult && regexResult.groups) {
                const last = this.ifStack[this.ifStack.length - 1];
                const condition =
                    !(last?.already ?? false) &&
                    this.evaluateCondition(
                        regexResult.groups.condition,
                        position
                    );
                const is: IfState = {
                    position:
                        last?.condition ?? true ? position : last.position,
                    condition,
                    already: last?.already || condition,
                    offset,
                };
                return is;
            }
        }
        return null;
    }

    private getElseStatement(text: string, position: number): IfState | null {
        const regex = /#\s*?else\b.*?(?=\n|$)/;
        const regexResult = regex.exec(text);
        if (regexResult) {
            const last = this.ifStack[this.ifStack.length - 1];
            const condition = !(last?.already ?? false);
            const is: IfState = {
                position: last?.condition ?? true ? position : last.position,
                condition,
                already: true,
                offset: 0,
            };
            return is;
        }
        return null;
    }

    private isEndifStatement(text: string): boolean {
        const regex = /#\s*?endif\b.*?(?=\n|$)/;
        return !!regex.exec(text);
    }

    private evaluateCondition(condition: string, position: number): boolean {
        const lexer = this.createLexer(condition);
        const parser = this.createParser(lexer);
        const tree = parser.expression();
        const visitor = new ConditionVisitor(this.snapshot, position);
        return !!visitor.visit(tree);
    }

    private createLexer(text: string): ConditionLexer {
        //The ANTLRInputStream class is deprecated, however as far as I know this is the only way the TypeScript version of ANTLR accepts UTF-16 strings.
        //The CharStreams.fromString method only accepts UTF-8 and other methods of the CharStreams class are not implemented in TypeScript.
        const charStream = new ANTLRInputStream(text);
        const lexer = new ConditionLexer(charStream);
        lexer.removeErrorListeners();
        // this.tokens = lexer.getAllTokens();
        // lexer.reset();
        return lexer;
    }

    private createParser(lexer: ConditionLexer): ConditionParser {
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new ConditionParser(tokenStream);
        parser.removeErrorListeners();
        return parser;
    }

    private getIfdefStatement(text: string, position: number): IfState | null {
        const regex = /#\s*?(?<directive>ifn?def\b)(?<condition>.*?)(?=\n|$)/;
        const regexResult = regex.exec(text);
        if (regexResult && regexResult.groups) {
            const directive = regexResult.groups.directive;
            const condition = regexResult.groups.condition.trim();
            let defined = isDefined(
                condition,
                regexResult.index + position,
                this.snapshot
            );
            if (directive === 'ifndef') {
                defined = !defined;
            }
            const is: IfState = {
                position: regexResult.index + position,
                condition: defined,
                already: defined,
                offset: 0,
            };
            return is;
        }
        return null;
    }

    private getDefineStatement(
        text: string,
        position: number
    ): DefineStatement | null {
        if (this.ifStack.some((is) => !is.condition)) {
            return null;
        }
        let regex =
            /#\s*?define\s+?(?<name>[a-zA-Z_]\w*?)\s+?(?<content>.*?)?(?=\n|$)/;
        let regexResult = regex.exec(text);
        if (regexResult && regexResult.groups) {
            const name = regexResult.groups.name;
            const content =
                regexResult.groups.content
                    ?.trim()
                    .replace(/\s*#\s*#\s*/g, '') ?? '';
            const ds: DefineStatement = {
                objectLike: true,
                position: regexResult.index + position,
                name,
                parameters: [],
                content,
                undefPosition: null,
            };
            this.snapshot.defineStatements.push(ds);
            return ds;
        }
        regex =
            /#\s*?define\s+?(?<name>[a-zA-Z_]\w*?)\((?<params>\s*?[a-zA-Z_]\w*?(\s*?,\s*?[a-zA-Z_]\w*?)*?\s*?,?)?\s*?\)(?<content>.*?)?(?=\n|$)/;
        regexResult = regex.exec(text);
        if (regexResult && regexResult.groups) {
            const name = regexResult.groups.name;
            const content = regexResult.groups.content?.trim() ?? '';
            const ds: DefineStatement = {
                objectLike: false,
                position: regexResult.index + position,
                name,
                parameters:
                    regexResult.groups.params
                        ?.replace(/\s/g, '')
                        .split(',')
                        .filter((p) => p.length) ?? [],
                content,
                undefPosition: null,
            };
            this.snapshot.defineStatements.push(ds);
            return ds;
        }
        return null;
    }

    private isUndefStatement(text: string, position: number): boolean {
        if (this.ifStack.some((is) => !is.condition)) {
            return false;
        }
        const regex = /#\s*?undef\s+?(?<name>[a-zA-Z_]\w*?).*?(?=\n|$)/;
        const regexResult = regex.exec(text);
        if (regexResult && regexResult.groups) {
            if (this.ifStack.every((is) => is.condition)) {
                const name = regexResult.groups.name;
                this.snapshot.defineStatements
                    .filter((ds) => ds.name === name && ds.position <= position)
                    .forEach((ds) => {
                        if (ds.undefPosition == null)
                            ds.undefPosition = position;
                    });
            }
            return true;
        }
        return false;
    }

    private getIncludeStatement(
        text: string,
        position: number,
        parentIc: IncludeContext | null
    ): IncludeStatement | null {
        let regex = /(?<=#\s*include\s*")[^"]*?(?=")/;
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
        regex = /(?<=#\s*include\s*<)[^>]*?(?=>)/;
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
            const mc = this.snapshot.macroContexts.find(
                (me) =>
                    me.startPosition <= position && position <= me.endPosition
            );
            if (!parentIc && !mc) {
                this.snapshot.includeStatements.push(is);
            }
            return is;
        }
        return null;
    }
}

export function isDefined(
    text: string,
    position: number,
    snapshot: Snapshot
): boolean {
    return !!snapshot.defineStatements.find(
        (ds) =>
            ds.name === text &&
            ds.position <= position &&
            (ds.undefPosition == null || ds.undefPosition > position)
    );
}

export function expandMacros(
    fromPosition: number,
    toPosition: number,
    snapshot: Snapshot,
    macroNames: string
): DefineContext[] {
    if (!snapshot.defineStatements.length) {
        return [];
    }

    const macroIdentifierRegex = new RegExp(`\\b(${macroNames})\\b`, 'g');
    macroIdentifierRegex.lastIndex = fromPosition;
    let regexResult: RegExpExecArray | null;
    const result: DefineContext[] = [];
    while (
        (regexResult = macroIdentifierRegex.exec(
            snapshot.text.substring(0, toPosition)
        ))
    ) {
        const identifierStartPosition = regexResult.index;
        const identifier = regexResult[0];
        const identifierEndPosition =
            identifierStartPosition + identifier.length;
        macroIdentifierRegex.lastIndex = identifierEndPosition;

        const ma = getMacroArguments(identifierEndPosition, snapshot);
        const objectLike = !ma;
        const ds =
            snapshot.defineStatements.find(
                (ds) =>
                    ds.name === identifier &&
                    ds.position <= identifierStartPosition &&
                    ds.objectLike === objectLike &&
                    ds.parameters.length === (ma?.arguments?.length ?? 0) &&
                    (ds.undefPosition == null ||
                        ds.undefPosition > identifierStartPosition)
            ) ?? null;
        if (!ds) {
            continue;
        }
        const parentDc = snapshot.defineContextAt(identifierStartPosition);
        if (isCircularDefineExpansion(parentDc, ds)) {
            continue;
        }
        const beforeEndPosition = ma ? ma.endPosition : identifierEndPosition;
        const stringPositions = getStringRanges(
            beforeEndPosition,
            snapshot.text
        );
        if (
            stringPositions.some(
                (sr) =>
                    sr.startPosition <= identifierStartPosition &&
                    identifierEndPosition <= sr.endPosition
            )
        ) {
            continue;
        }
        let pasteText = ds.content;
        let parameterReplacements: ElementRange[] = [];
        let dc: DefineContext | null = null;
        if (!ds.objectLike) {
            if (ds.parameters.length) {
                const parameterNames = ds.parameters.join('|');
                const macroParameterRegex = new RegExp(
                    `(?<![^#\\s]\\s*#\\s*)((?<stringification>#)\\s*?)?\\b(?<name>${parameterNames})\\b`,
                    'g'
                );
                let regexResult: RegExpExecArray | null;
                while ((regexResult = macroParameterRegex.exec(pasteText))) {
                    const parameterStartPosition = regexResult.index;
                    const parameterMatch = regexResult[0];
                    const parameterBeforeEndPosition =
                        parameterStartPosition + parameterMatch.length;
                    if (regexResult.groups) {
                        const parameterName = regexResult.groups.name;
                        const stringification =
                            !!regexResult.groups.stringification;
                        const argument = ma
                            ? ma.arguments[ds.parameters.indexOf(parameterName)]
                            : parameterName;
                        const replacement = stringification
                            ? stringify(argument)
                            : argument;
                        pasteText = getChangedText(
                            parameterStartPosition,
                            parameterBeforeEndPosition,
                            replacement,
                            pasteText
                        );
                        const parameterAfterEndPosition =
                            parameterStartPosition + replacement.length;
                        if (!stringification) {
                            parameterReplacements.push({
                                startPosition:
                                    identifierStartPosition +
                                    parameterStartPosition,
                                endPosition:
                                    identifierStartPosition +
                                    parameterAfterEndPosition,
                            });
                        }
                        macroParameterRegex.lastIndex =
                            parameterAfterEndPosition;
                    }
                }
            }
            const regex = /\s*?#\s*?#\s*?/g;
            let regexResult: RegExpExecArray | null;
            while ((regexResult = regex.exec(pasteText))) {
                const position = regexResult.index;
                const match = regexResult[0];
                const beforeEndPosition = position + match.length;
                pasteText = getChangedText(
                    position,
                    beforeEndPosition,
                    '',
                    pasteText
                );
                regex.lastIndex = position;
                for (const r of parameterReplacements) {
                    if (position < r.startPosition) {
                        r.startPosition -= match.length;
                        r.endPosition -= match.length;
                    }
                }
            }
            for (let i = 0; i < parameterReplacements.length; i++) {
                for (let j = 0; j < parameterReplacements.length; j++) {
                    if (
                        i !== j &&
                        parameterReplacements[i].endPosition ===
                            parameterReplacements[j].startPosition
                    ) {
                        parameterReplacements[i].endPosition =
                            parameterReplacements[j].endPosition;
                        parameterReplacements[j].startPosition = -1;
                        parameterReplacements[j].endPosition = -1;
                    }
                }
            }
            parameterReplacements = parameterReplacements.filter(
                (r) => r.startPosition >= 0
            );

            const afterEndPosition = identifierStartPosition + pasteText.length;
            dc = {
                define: ds,
                startPosition: identifierStartPosition,
                beforeEndPosition,
                afterEndPosition,
                result: pasteText,
                parent: parentDc,
                children: [],
            };
            result.push(dc);
            addPreprocessingOffset(
                identifierStartPosition,
                beforeEndPosition,
                afterEndPosition,
                snapshot
            );
            changeText(
                identifierStartPosition,
                beforeEndPosition,
                pasteText,
                snapshot
            );
            snapshot.defineContexts.push(dc);
            for (const replacement of parameterReplacements) {
                const dcs = expandMacros(
                    replacement.startPosition,
                    replacement.endPosition,
                    snapshot,
                    macroNames
                );
                const offset = dcs
                    .map((dc) => dc.afterEndPosition - dc.beforeEndPosition)
                    .reduce((prev, curr) => prev + curr, 0);
                for (const r of parameterReplacements) {
                    r.startPosition += offset;
                    r.endPosition += offset;
                }
            }
            expandMacros(fromPosition, toPosition, snapshot, macroNames);
        } else {
            const afterEndPosition = identifierStartPosition + pasteText.length;
            dc = {
                define: ds,
                startPosition: identifierStartPosition,
                beforeEndPosition,
                afterEndPosition,
                result: pasteText,
                parent: parentDc,
                children: [],
            };
            result.push(dc);
            addPreprocessingOffset(
                identifierStartPosition,
                beforeEndPosition,
                afterEndPosition,
                snapshot
            );
            changeText(
                identifierStartPosition,
                beforeEndPosition,
                pasteText,
                snapshot
            );
            snapshot.defineContexts.push(dc);
        }

        macroIdentifierRegex.lastIndex =
            dc?.afterEndPosition ?? identifierStartPosition;
        toPosition += dc ? dc.afterEndPosition - dc.beforeEndPosition : 0;
    }
    return result;
}

function stringify(argument: string): string {
    const stringRanges = getStringRanges(argument.length, argument);
    const regex = /"|\\/g;
    let result = argument;
    let regexResult: RegExpExecArray | null;
    while ((regexResult = regex.exec(result))) {
        const position = regexResult.index;
        const quote = regexResult[0] === '"';
        if (
            quote ||
            stringRanges.some(
                (sr) =>
                    sr.startPosition <= position && position < sr.endPosition
            )
        ) {
            result = getChangedText(position, position, '\\', result);
            for (const stringRange of stringRanges) {
                if (stringRange.startPosition > position) {
                    stringRange.startPosition++;
                }
                if (stringRange.endPosition > position) {
                    stringRange.endPosition++;
                }
            }
            regex.lastIndex = position + 2;
        }
    }
    return `"${result}"`;
}

function isCircularDefineExpansion(
    dc: DefineContext | null,
    ds: DefineStatement | null
): boolean {
    let currentDc: DefineContext | null = dc;
    while (currentDc) {
        if (currentDc.define === ds) {
            return true;
        }
        currentDc = currentDc.parent;
    }
    return false;
}
