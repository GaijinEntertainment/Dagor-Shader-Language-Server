import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { DocumentUri } from 'vscode-languageserver';

import { ConditionLexer } from '../_generated/ConditionLexer';
import { ConditionParser } from '../_generated/ConditionParser';
import { Snapshot } from '../core/snapshot';
import { defaultRange } from '../helper/helper';
import { DefineContext } from '../interface/define-context';
import { DefineStatement } from '../interface/define-statement';
import { ElementRange } from '../interface/element-range';
import { HlslBlock } from '../interface/hlsl-block';
import { IfState } from '../interface/if-state';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { invalidVersion } from '../interface/snapshot-version';
import { ConditionVisitor } from './condition-visitor';
import { getIncludedDocumentUri } from './include-resolver';
import { Preprocessor } from './preprocessor';

export async function preprocessHlsl(snapshot: Snapshot): Promise<void> {
    return await new HlslPreprocessor(snapshot).preprocess();
}

export class HlslPreprocessor {
    private snapshot: Snapshot;
    private ifStack: IfState[][] = [];
    private removeRanges: ElementRange[] = [];
    private macroNames = '';

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
    }

    public async preprocess(): Promise<void> {
        await this.preprocessDirectives();
        this.removeCode();
        // this.refreshMacroNames();
        //HlslPreprocessor.expandMacros(0, this.snapshot.text.length, this.snapshot, this.macroNames);
    }

    private removeCode(): void {
        let offset = 0;
        for (const range of this.removeRanges.sort((a, b) => a.startPosition - b.startPosition)) {
            range.startPosition += offset;
            range.endPosition += offset;
            Preprocessor.removeTextAndAddOffset(range.startPosition, range.endPosition, this.snapshot);
            offset += range.startPosition - range.endPosition;
        }
    }

    private async preprocessDirectives(): Promise<void> {
        const regex = /#.*/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            if (Preprocessor.isInString(position, this.snapshot)) {
                continue;
            }
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const nextStartPosition = await this.preprocessDirective(position, beforeEndPosition, match);
            regex.lastIndex = nextStartPosition;
        }
    }

    private async preprocessDirective(position: number, beforeEndPosition: number, match: string): Promise<number> {
        let regexResult = /#[ \t]*include[ \t]*(?:"(?<quotedPath>(?:[^"]|\\")*)"|<(?<angularPath>[^>]*)>)/.exec(match);
        if (regexResult) {
            return await this.preprocessInclude(regexResult, position);
        }
        const ifRegex = /^#[ \t]*if\b(?<condition>.*)/;
        regexResult = ifRegex.exec(match);
        if (regexResult) {
            this.preprocessIf(ifRegex, regexResult, position);
            return beforeEndPosition;
        }
        const ifdefRegex = /#[ \t]*(?<directive>ifn?def\b)(?<condition>.*)/;
        regexResult = ifdefRegex.exec(match);
        if (regexResult) {
            this.preprocessIfdef(regexResult, position);
            return beforeEndPosition;
        }
        const elifRegex = /^#[ \t]*elif\b(?<condition>.*)/;
        regexResult = elifRegex.exec(match);
        if (regexResult) {
            this.preprocessElif(elifRegex, regexResult, position);
            return beforeEndPosition;
        }
        const elseRegex = /^#[ \t]*else\b.*/;
        regexResult = elseRegex.exec(match);
        if (regexResult) {
            this.preprocessElse(position);
            return beforeEndPosition;
        }
        const endifRegex = /^#[ \t]*endif\b.*/;
        regexResult = endifRegex.exec(match);
        if (regexResult) {
            this.preprocessEndif(position);
            return beforeEndPosition;
        }
        if (!this.isAnyFalseAbove()) {
            const functionDefineRegex =
                /#[ \t]*define[ \t]+(?<name>[a-zA-Z_]\w*)\((?<params>[ \t]*[a-zA-Z_]\w*([ \t]*,[ \t]*[a-zA-Z_]\w*)*[ \t]*,?)?[ \t]*\)(?<content>.*)?/;
            regexResult = functionDefineRegex.exec(match);
            if (regexResult) {
                this.preprocessFunctionDefine(regexResult, position);
                return beforeEndPosition;
            }
            const objectDefineRegex = /#[ \t]*define[ \t]+(?<name>[a-zA-Z_]\w*)[ \t]*(?<content>.*)?/;
            regexResult = objectDefineRegex.exec(match);
            if (regexResult) {
                this.preprocessObjectDefine(regexResult, position);
                return beforeEndPosition;
            }
            const undefRegex = /#[ \t]*undef[ \t]+(?<name>[a-zA-Z_]\w*).*/;
            regexResult = undefRegex.exec(match);
            if (regexResult) {
                this.preprocessUndef(regexResult, position);
                return beforeEndPosition;
            }
        }
        return beforeEndPosition;
    }

    private async preprocessInclude(regexResult: RegExpExecArray, offset: number): Promise<number> {
        const position = offset + regexResult.index;
        const match = regexResult[0];
        const beforeEndPosition = position + match.length;
        const path = regexResult.groups?.quotedPath ?? regexResult.groups?.angularPath ?? '';
        const type = regexResult.groups?.quotedPath ? IncludeType.HLSL_QUOTED : IncludeType.HLSL_ANGULAR;
        const mc = this.snapshot.isInMacroContext(position);
        const parentIc = this.snapshot.getIncludeContextDeepAt(position);
        const is = Preprocessor.createIncludeStatement(beforeEndPosition, type, path, mc, parentIc, this.snapshot);
        if (this.isAnyFalseAbove(true)) {
            return beforeEndPosition;
        }
        await this.includeContent(position, beforeEndPosition, is, parentIc);
        return offset;
    }

    private async includeContent(
        position: number,
        beforeEndPosition: number,
        is: IncludeStatement,
        parentIc: IncludeContext | null
    ): Promise<void> {
        const uri = await getIncludedDocumentUri(is);
        const includeSnapshot = await this.getInclude(uri, parentIc);
        const includeText = includeSnapshot.text;
        const afterEndPosition = position + includeText.length;
        Preprocessor.changeTextAndAddOffset(position, beforeEndPosition, afterEndPosition, includeText, this.snapshot);
        const ic = this.createIncludeContext(position, afterEndPosition, uri, parentIc, is);
        if (ic) {
            Preprocessor.addStringRanges(position, afterEndPosition, this.snapshot);
        }
    }

    private async getInclude(uri: DocumentUri | null, parentIc: IncludeContext | null): Promise<Snapshot> {
        if (!uri || this.isCircularInclude(parentIc, uri)) {
            return new Snapshot(invalidVersion, '', '');
        }
        const snapshot = await Preprocessor.getSnapshot(uri, this.snapshot);
        new Preprocessor(snapshot).clean();
        return snapshot;
    }

    private createIncludeContext(
        position: number,
        afterEndPosition: number,
        uri: DocumentUri | null,
        parentIc: IncludeContext | null,
        is: IncludeStatement
    ): IncludeContext | null {
        if (!uri) {
            return null;
        }
        const ic: IncludeContext = {
            startPosition: position,
            localStartPosition: position,
            endPosition: afterEndPosition,
            includeStatement: is,
            snapshot: this.snapshot,
            parent: parentIc,
            children: [],
            originalEndPosition: this.snapshot.getOriginalPosition(afterEndPosition, false),
        };
        if (parentIc) {
            parentIc.children.push(ic);
        } else {
            this.snapshot.includeContexts.push(ic);
        }
        return ic;
    }

    private isCircularInclude(ic: IncludeContext | null, uri: DocumentUri | null): boolean {
        if (this.snapshot.uri === uri) {
            return true;
        }
        let currentIc = ic;
        while (currentIc) {
            if (currentIc?.snapshot?.uri === uri) {
                return true;
            }
            currentIc = currentIc.parent;
        }
        return false;
    }

    private preprocessIf(regex: RegExp, regexResult: RegExpExecArray, offset: number): void {
        const ifState: IfState = { position: offset, condition: false };
        this.ifStack.push([ifState]);
        if (!this.isAnyFalseAbove()) {
            this.refreshMacroNames();
            const position = offset + regexResult.index;
            const match = regexResult[0];
            const dcs = HlslPreprocessor.expandMacros(
                position,
                position + match.length,
                this.snapshot,
                this.macroNames
            );
            const expansionOffset = dcs
                .map((dc) => dc.afterEndPosition - dc.beforeEndPosition)
                .reduce((prev, curr) => prev + curr, 0);
            const finalRegexResult = regex.exec(
                this.snapshot.text.substring(position, position + match.length + expansionOffset)
            );
            if (finalRegexResult && finalRegexResult.groups) {
                ifState.condition = this.evaluateCondition(finalRegexResult.groups.condition, position);
            }
        }
    }

    private preprocessIfdef(regexResult: RegExpExecArray, offset: number): void {
        const ifState: IfState = { position: offset, condition: false };
        this.ifStack.push([ifState]);
        if (!this.isAnyFalseAbove() && regexResult.groups) {
            const position = offset + regexResult.index;
            const directive = regexResult.groups.directive;
            const condition = regexResult.groups.condition.trim();
            let defined = HlslPreprocessor.isDefined(condition, position, this.snapshot);
            if (directive === 'ifndef') {
                defined = !defined;
            }
            ifState.condition = defined;
        }
    }

    private preprocessElif(regex: RegExp, regexResult: RegExpExecArray, offset: number): void {
        const ifState: IfState = { position: offset, condition: false };
        HlslPreprocessor.addIfFoldingRange(offset, this.ifStack, this.snapshot);
        if (!this.isAnyFalseAbove() && this.isAllFalseInTheSameLevel()) {
            this.refreshMacroNames();
            const position = offset + regexResult.index;
            const match = regexResult[0];
            const dcs = HlslPreprocessor.expandMacros(
                position,
                position + match.length,
                this.snapshot,
                this.macroNames
            );
            const expansionOffset = dcs
                .map((dc) => dc.afterEndPosition - dc.beforeEndPosition)
                .reduce((prev, curr) => prev + curr, 0);
            const finalRegexResult = regex.exec(
                this.snapshot.text.substring(position, position + match.length + expansionOffset)
            );
            if (finalRegexResult && finalRegexResult.groups) {
                ifState.condition = this.evaluateCondition(finalRegexResult.groups.condition, position);
            }
        }
        HlslPreprocessor.addIfState(this.ifStack, ifState);
    }

    private preprocessElse(offset: number): void {
        const ifState: IfState = { position: offset, condition: false };
        HlslPreprocessor.addIfFoldingRange(offset, this.ifStack, this.snapshot);
        if (!this.isAnyFalseAbove() && this.isAllFalseInTheSameLevel()) {
            ifState.condition = true;
        }
        HlslPreprocessor.addIfState(this.ifStack, ifState);
    }

    private preprocessEndif(position: number): void {
        HlslPreprocessor.addIfFoldingRange(position, this.ifStack, this.snapshot);
        if (!this.isAnyFalseAbove()) {
            this.addRemoveRanges(position);
        }
        this.ifStack.pop();
    }

    private addRemoveRanges(position: number): void {
        if (this.ifStack.length) {
            const ifStates = this.ifStack[this.ifStack.length - 1];
            let lastPosition = -1;
            for (const ifState of ifStates) {
                if (ifState.condition) {
                    if (lastPosition !== -1) {
                        this.removeRanges.push({ startPosition: lastPosition, endPosition: ifState.position });
                    }
                    lastPosition = -1;
                } else {
                    if (lastPosition === -1) {
                        lastPosition = ifState.position;
                    }
                }
            }
            if (lastPosition !== -1) {
                this.removeRanges.push({ startPosition: lastPosition, endPosition: position });
            }
        }
    }

    private isAnyFalseAbove(checkLastLevel = false): boolean {
        const offset = checkLastLevel ? 0 : 1;
        for (let i = 0; i < this.ifStack.length - offset; i++) {
            const ifStates = this.ifStack[i];
            const ifState = ifStates[ifStates.length - 1];
            if (!ifState.condition) {
                return true;
            }
        }
        return false;
    }

    private isAllFalseInTheSameLevel(): boolean {
        if (this.ifStack.length) {
            const ifStates = this.ifStack[this.ifStack.length - 1];
            return !ifStates.some((ifState) => ifState.condition);
        }
        return true;
    }

    public static addIfFoldingRange(position: number, ifStack: IfState[][], snapshot: Snapshot): void {
        const mc = snapshot.isInMacroContext(position);
        const ic = snapshot.isInIncludeContext(position);
        if (!mc && !ic && ifStack.length) {
            const ifStates = ifStack[ifStack.length - 1];
            if (ifStates.length) {
                const ifState = ifStates[ifStates.length - 1];
                const originalRange = snapshot.getOriginalRange(ifState.position, position);
                snapshot.ifRanges.push(originalRange);
            }
        }
    }

    public static addIfState(ifStack: IfState[][], ifState: IfState): void {
        if (ifStack.length) {
            const ifStates = ifStack[ifStack.length - 1];
            ifStates.push(ifState);
        }
    }

    private preprocessObjectDefine(regexResult: RegExpExecArray, offset: number): void {
        const content = regexResult.groups?.content?.trim().replace(/[ \t]*#[ \t]*#[ \t]*/g, '') ?? '';
        this.preprocessDefine(regexResult, offset, true, [], content);
    }

    private preprocessFunctionDefine(regexResult: RegExpExecArray, offset: number): void {
        const parameters =
            regexResult.groups?.params
                ?.replace(/[ \t]/g, '')
                .split(',')
                .filter((p) => p.length) ?? [];
        const content = regexResult.groups?.content?.trim() ?? '';
        this.preprocessDefine(regexResult, offset, false, parameters, content);
    }

    private preprocessDefine(
        regexResult: RegExpExecArray,
        offset: number,
        objectLike: boolean,
        parameters: string[],
        content: string
    ): void {
        if (regexResult.groups) {
            const position = regexResult.index + offset;
            const name = regexResult.groups.name;
            const match = regexResult[0];
            const ic = this.snapshot.getIncludeContextAt(position);
            const isVisible = !ic && !this.snapshot.isInMacroContext(position);
            const originalRange = isVisible
                ? this.snapshot.getOriginalRange(position, position + match.length)
                : defaultRange;
            const nameOriginalRange = isVisible
                ? this.snapshot.getOriginalRange(position, position + name.length)
                : defaultRange;
            const ds: DefineStatement = {
                objectLike,
                position,
                originalRange,
                nameOriginalRange,
                name,
                parameters,
                content,
                undefPosition: null,
                codeCompletionPosition: ic ? ic.originalEndPosition : nameOriginalRange.end,
                undefCodeCompletionPosition: null,
                isVisible,
            };
            this.addDefine(position, ds);
        }
    }

    private addDefine(position: number, ds: DefineStatement): void {
        this.snapshot.defineStatements.push(ds);
        const shaderBlock = this.snapshot.shaderBlocks.find(
            (sb) => sb.startPosition <= position && position <= sb.endPosition
        );
        if (shaderBlock) {
            this.addDefineToHlslBlock(position, shaderBlock.hlslBlocks, ds);
        } else {
            this.addDefineToHlslBlock(position, this.snapshot.globalHlslBlocks, ds);
        }
    }

    private addDefineToHlslBlock(position: number, hlslBlocks: HlslBlock[], ds: DefineStatement): void {
        const hb = hlslBlocks.find((hb) => hb.startPosition <= position && position <= hb.endPosition);
        if (hb) {
            hb.defineStatements.push(ds);
        }
    }

    private preprocessUndef(regexResult: RegExpExecArray, position: number): void {
        if (regexResult.groups) {
            const name = regexResult.groups.name;
            const ic = this.snapshot.getIncludeContextAt(position);
            this.snapshot.defineStatements
                .filter((ds) => ds.name === name && ds.position <= position)
                .forEach((ds) => {
                    if (ds.undefPosition === null) {
                        ds.undefPosition = position;
                        ds.undefCodeCompletionPosition = ic
                            ? ic.originalEndPosition
                            : this.snapshot.getOriginalPosition(position, true);
                    }
                });
        }
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

    private refreshMacroNames(): void {
        const mn = this.snapshot.defineStatements.map((ds) => ds.name);
        const umn = [...new Set(mn)];
        this.macroNames = umn.join('|');
    }

    public static isDefined(text: string, position: number, snapshot: Snapshot): boolean {
        return !!snapshot.defineStatements.find(
            (ds) =>
                ds.name === text && ds.position <= position && (ds.undefPosition == null || ds.undefPosition > position)
        );
    }

    public static expandMacros(
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
        while ((regexResult = macroIdentifierRegex.exec(snapshot.text.substring(0, toPosition)))) {
            const identifierStartPosition = regexResult.index;
            const identifier = regexResult[0];
            const identifierEndPosition = identifierStartPosition + identifier.length;
            macroIdentifierRegex.lastIndex = identifierEndPosition;

            const ma = Preprocessor.getMacroArguments(identifierEndPosition, snapshot);
            const objectLike = !ma;
            const ds =
                snapshot.defineStatements.find(
                    (ds) =>
                        ds.name === identifier &&
                        ds.position <= identifierStartPosition &&
                        ds.objectLike === objectLike &&
                        ds.parameters.length === (ma?.arguments?.length ?? 0) &&
                        (ds.undefPosition == null || ds.undefPosition > identifierStartPosition)
                ) ?? null;
            if (!ds) {
                continue;
            }
            const parentDc = snapshot.defineContextAt(identifierStartPosition);
            if (HlslPreprocessor.isCircularDefineExpansion(parentDc, ds)) {
                continue;
            }
            const beforeEndPosition = ma ? ma.endPosition : identifierEndPosition;
            if (Preprocessor.isInString(identifierStartPosition, snapshot)) {
                continue;
            }
            const macroSnapshot = new Snapshot(invalidVersion, '', '');
            macroSnapshot.text = ds.content;
            Preprocessor.addStringRanges(0, macroSnapshot.text.length, macroSnapshot);
            let parameterReplacements: ElementRange[] = [];
            let dc: DefineContext | null = null;
            if (!ds.objectLike) {
                if (ds.parameters.length) {
                    const parameterNames = ds.parameters.join('|');
                    const macroParameterRegex = new RegExp(
                        `(?<![^# \\t][ \\t]*#[ \\t]*)((?<stringification>#)[ \\t]*)?\\b(?<name>${parameterNames})\\b`,
                        'g'
                    );
                    let regexResult: RegExpExecArray | null;
                    while ((regexResult = macroParameterRegex.exec(macroSnapshot.text))) {
                        const parameterStartPosition = regexResult.index;
                        if (Preprocessor.isInString(parameterStartPosition, macroSnapshot)) {
                            continue;
                        }
                        const parameterMatch = regexResult[0];
                        const parameterBeforeEndPosition = parameterStartPosition + parameterMatch.length;
                        if (regexResult.groups) {
                            const parameterName = regexResult.groups.name;
                            const stringification = !!regexResult.groups.stringification;
                            const argument = ma
                                ? ma.arguments[ds.parameters.indexOf(parameterName)].content
                                : parameterName;
                            const replacement = stringification ? HlslPreprocessor.stringify(argument) : argument;
                            const parameterAfterEndPosition = parameterStartPosition + replacement.length;
                            Preprocessor.changeTextAndAddOffset(
                                parameterStartPosition,
                                parameterBeforeEndPosition,
                                parameterAfterEndPosition,
                                replacement,
                                macroSnapshot
                            );
                            Preprocessor.addStringRanges(
                                parameterStartPosition,
                                parameterAfterEndPosition,
                                macroSnapshot
                            );

                            if (!stringification) {
                                parameterReplacements.push({
                                    startPosition: identifierStartPosition + parameterStartPosition,
                                    endPosition: identifierStartPosition + parameterAfterEndPosition,
                                });
                            }
                            macroParameterRegex.lastIndex = parameterAfterEndPosition;
                        }
                    }
                }
                const regex = /[ \t]*#[ \t]*#[ \t]*/g;
                let regexResult: RegExpExecArray | null;
                while ((regexResult = regex.exec(macroSnapshot.text))) {
                    const position = regexResult.index;
                    if (Preprocessor.isInString(position, macroSnapshot)) {
                        continue;
                    }
                    const match = regexResult[0];
                    const beforeEndPosition = position + match.length;
                    Preprocessor.changeTextAndAddOffset(position, beforeEndPosition, position, '', macroSnapshot);
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
                            parameterReplacements[i].endPosition === parameterReplacements[j].startPosition
                        ) {
                            parameterReplacements[i].endPosition = parameterReplacements[j].endPosition;
                            parameterReplacements[j].startPosition = -1;
                            parameterReplacements[j].endPosition = -1;
                        }
                    }
                }
                parameterReplacements = parameterReplacements.filter((r) => r.startPosition >= 0);

                const afterEndPosition = identifierStartPosition + macroSnapshot.text.length;
                dc = {
                    define: ds,
                    startPosition: identifierStartPosition,
                    beforeEndPosition,
                    afterEndPosition,
                    result: macroSnapshot.text,
                    parent: parentDc,
                    children: [],
                };
                result.push(dc);
                Preprocessor.changeTextAndAddOffset(
                    identifierStartPosition,
                    beforeEndPosition,
                    afterEndPosition,
                    macroSnapshot.text,
                    snapshot
                );
                Preprocessor.addStringRanges(identifierStartPosition, afterEndPosition, snapshot);
                snapshot.defineContexts.push(dc);
                for (const replacement of parameterReplacements) {
                    const dcs = HlslPreprocessor.expandMacros(
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
                HlslPreprocessor.expandMacros(fromPosition, toPosition, snapshot, macroNames);
            } else {
                const afterEndPosition = identifierStartPosition + macroSnapshot.text.length;
                dc = {
                    define: ds,
                    startPosition: identifierStartPosition,
                    beforeEndPosition,
                    afterEndPosition,
                    result: macroSnapshot.text,
                    parent: parentDc,
                    children: [],
                };
                result.push(dc);
                Preprocessor.changeTextAndAddOffset(
                    identifierStartPosition,
                    beforeEndPosition,
                    afterEndPosition,
                    macroSnapshot.text,
                    snapshot
                );
                Preprocessor.addStringRanges(identifierStartPosition, afterEndPosition, snapshot);
                snapshot.defineContexts.push(dc);
            }

            macroIdentifierRegex.lastIndex = dc?.afterEndPosition ?? identifierStartPosition;
            toPosition += dc ? dc.afterEndPosition - dc.beforeEndPosition : 0;
        }
        return result;
    }

    private static stringify(argument: string): string {
        const argumentSnapshot = new Snapshot(invalidVersion, '', '');
        argumentSnapshot.text = argument;
        Preprocessor.addStringRanges(0, argument.length, argumentSnapshot);
        const regex = /"|\\/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(argumentSnapshot.text))) {
            const position = regexResult.index;
            const quote = regexResult[0] === '"';
            if (quote || Preprocessor.isInString(position, argumentSnapshot)) {
                Preprocessor.changeTextAndAddOffset(position, position, position + 2, '\\', argumentSnapshot);
                regex.lastIndex = position + 2;
            }
        }
        return `"${argumentSnapshot.text}"`;
    }

    private static isCircularDefineExpansion(dc: DefineContext | null, ds: DefineStatement | null): boolean {
        let currentDc: DefineContext | null = dc;
        while (currentDc) {
            if (currentDc.define === ds) {
                return true;
            }
            currentDc = currentDc.parent;
        }
        return false;
    }
}
