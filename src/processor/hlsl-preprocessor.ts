import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { DocumentUri } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { ConditionLexer } from '../_generated/ConditionLexer';
import { ConditionParser } from '../_generated/ConditionParser';
import { getSnapshot } from '../core/document-manager';
import { getFileContent } from '../core/file-cache-manager';
import { Snapshot } from '../core/snapshot';
import { PerformanceHelper } from '../helper/performance-helper';
import { DefineContext } from '../interface/define-context';
import { DefineStatement } from '../interface/define-statement';
import { ElementRange } from '../interface/element-range';
import { IfState } from '../interface/if-state';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { ConditionVisitor } from './condition-visitor';
import { getIncludedDocumentUri } from './include-resolver';
import { Preprocessor } from './preprocessor';

export async function preprocessHlsl(snapshot: Snapshot): Promise<void> {
    return await new HlslPreprocessor(snapshot).preprocess();
}

export class HlslPreprocessor {
    private snapshot: Snapshot;
    private ifStack: IfState[] = [];
    private macroNames = '';
    private ph: PerformanceHelper;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
        this.ph = new PerformanceHelper(this.snapshot.uri);
    }

    public async preprocess(): Promise<void> {
        this.ph.start('preprocess');
        this.ph.start('preprocessDirectives');
        await this.preprocessDirectives();
        this.ph.end('preprocessDirectives');
        this.refreshMacroNames();
        this.ph.start('expandMacros');
        HlslPreprocessor.expandMacros(
            0,
            this.snapshot.text.length,
            this.snapshot,
            this.macroNames
        );
        this.ph.end('expandMacros');
        this.ph.end('preprocess');
        this.ph.log('  HLSL preprocessor', 'preprocess');
        this.ph.log('    processing directives', 'preprocessDirectives');
        this.ph.log('    expanding macros', 'expandMacros');
    }

    private async preprocessDirectives(): Promise<void> {
        const regex = /#.*/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const nextStartPosition = await this.preprocessDirective(
                position,
                beforeEndPosition,
                match
            );
            regex.lastIndex = nextStartPosition;
        }
    }

    private async preprocessDirective(
        position: number,
        beforeEndPosition: number,
        match: string
    ): Promise<number> {
        const regexResult = this.getIncludeRegexResult(match);
        if (regexResult) {
            await this.preprocessInclude(regexResult, position);
            if (
                this.ifStack.some((is) => !is.condition) ||
                Preprocessor.isInString(position, this.snapshot)
            ) {
                return beforeEndPosition;
            }
            return position;
        }

        const is2 = this.getIfdefStatement(match, position);
        if (is2) {
            this.ifStack.push(is2);
            Preprocessor.removeTextAndAddOffset(
                position,
                beforeEndPosition,
                this.snapshot
            );
            return position;
        }
        const is4 = this.getIfStatement(match, position);
        if (is4) {
            this.ifStack.push(is4);
            Preprocessor.removeTextAndAddOffset(
                position,
                beforeEndPosition + is4.offset,
                this.snapshot
            );
            return position;
        }
        const is5 = this.getElifStatement(match, position);
        if (is5) {
            const oldIs = this.ifStack.pop();
            if (oldIs && !oldIs.condition) {
                Preprocessor.removeTextAndAddOffset(
                    position,
                    beforeEndPosition + is5.offset,
                    this.snapshot
                );
                this.ifStack.push(is5);
                return oldIs.position;
            } else {
                Preprocessor.removeTextAndAddOffset(
                    position,
                    beforeEndPosition + is5.offset,
                    this.snapshot
                );
                this.ifStack.push(is5);
                return position;
            }
        }
        const es = this.getElseStatement(match, position);
        if (es) {
            const oldIs = this.ifStack.pop();
            if (oldIs && !oldIs.condition) {
                Preprocessor.removeTextAndAddOffset(
                    oldIs.position,
                    beforeEndPosition,
                    this.snapshot
                );
                this.ifStack.push(es);
                return oldIs.position;
            } else {
                Preprocessor.removeTextAndAddOffset(
                    position,
                    beforeEndPosition,
                    this.snapshot
                );
                this.ifStack.push(es);
                return position;
            }
        }
        if (this.isEndifStatement(match)) {
            const is3 = this.ifStack.pop();
            if (is3 && !is3.condition) {
                Preprocessor.removeTextAndAddOffset(
                    is3.position,
                    beforeEndPosition,
                    this.snapshot
                );
                return is3.position;
            } else {
                Preprocessor.removeTextAndAddOffset(
                    position,
                    beforeEndPosition,
                    this.snapshot
                );
                return position;
            }
        }
        const ds = this.getDefineStatement(match, position);
        if (ds) {
            Preprocessor.removeTextAndAddOffset(
                position,
                beforeEndPosition,
                this.snapshot
            );
            return position;
        }
        if (this.isUndefStatement(match, position)) {
            Preprocessor.removeTextAndAddOffset(
                position,
                beforeEndPosition,
                this.snapshot
            );
            return position;
        }
        return beforeEndPosition;
    }

    private getIncludeRegexResult(text: string): RegExpExecArray | null {
        const regex =
            /#[ \t]*include[ \t]*(?:"(?<quotedPath>([^"]|\\")+)"|<(?<angularPath>[^>]+)>)/g;
        return regex.exec(text);
    }

    private async preprocessInclude(
        regexResult: RegExpExecArray,
        offset: number
    ): Promise<void> {
        const position = offset + regexResult.index;
        if (Preprocessor.isInString(position, this.snapshot)) {
            return;
        }
        if (regexResult.groups) {
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const path =
                regexResult.groups.quotedPath ?? regexResult.groups.angularPath;
            const type = regexResult.groups.quotedPath
                ? IncludeType.HLSL_QUOTED
                : IncludeType.HLSL_ANGULAR;
            const parentMc = this.snapshot.getMacroContextAt(position);
            const parentIc = this.snapshot.getIncludeContextDeepAt(position);
            const is = Preprocessor.createIncludeStatement(
                beforeEndPosition,
                type,
                path,
                parentMc,
                parentIc,
                this.snapshot
            );
            if (this.ifStack.some((is) => !is.condition)) {
                return;
            }
            await HlslPreprocessor.includeContent(
                position,
                beforeEndPosition,
                is,
                parentIc,
                this.snapshot
            );
        }
    }

    private getIfStatement(text: string, position: number): IfState | null {
        const regex = /#[ \t]*if\b(?<condition>.*)/;
        let regexResult = regex.exec(
            this.snapshot.text.substring(position, position + text.length)
        );
        if (regexResult) {
            this.refreshMacroNames();
            const dcs = HlslPreprocessor.expandMacros(
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
        const regex = /#[ \t]*elif\b(?<condition>.*)/;
        let regexResult = regex.exec(
            this.snapshot.text.substring(position, position + text.length)
        );
        if (regexResult) {
            this.refreshMacroNames();
            const dcs = HlslPreprocessor.expandMacros(
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
        const regex = /#[ \t]*else\b.*/;
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
        const regex = /#[ \t]*endif\b.*/;
        return !!regex.exec(text);
    }

    private getIfdefStatement(text: string, position: number): IfState | null {
        const regex = /#[ \t]*(?<directive>ifn?def\b)(?<condition>.*)/;
        const regexResult = regex.exec(text);
        if (regexResult && regexResult.groups) {
            const directive = regexResult.groups.directive;
            const condition = regexResult.groups.condition.trim();
            let defined = HlslPreprocessor.isDefined(
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
            /#[ \t]*define[ \t]+?(?<name>[a-zA-Z_]\w*)[ \t]+?(?<content>.*)?/;
        let regexResult = regex.exec(text);
        if (regexResult && regexResult.groups) {
            const name = regexResult.groups.name;
            const content =
                regexResult.groups.content
                    ?.trim()
                    .replace(/[ \t]*#[ \t]*#[ \t]*/g, '') ?? '';
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
            /#[ \t]*define[ \t]+(?<name>[a-zA-Z_]\w*)\((?<params>[ \t]*[a-zA-Z_]\w*([ \t]*,[ \t]*[a-zA-Z_]\w*)*[ \t]*,?)?[ \t]*\)(?<content>.*)?/;
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
                        ?.replace(/[ \t]/g, '')
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
        const regex = /#[ \t]*undef[ \t]+(?<name>[a-zA-Z_]\w*).*/;
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

    public static async includeContent(
        position: number,
        beforeEndPosition: number,
        is: IncludeStatement,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): Promise<void> {
        const uri = await getIncludedDocumentUri(is);
        const includeText = await HlslPreprocessor.getIncludeText(
            uri,
            parentIc,
            snapshot
        );
        const afterEndPosition = position + includeText.length;
        Preprocessor.changeTextAndAddOffset(
            position,
            beforeEndPosition,
            afterEndPosition,
            includeText,
            snapshot
        );
        const ic = HlslPreprocessor.createIncludeContext(
            position,
            afterEndPosition,
            uri,
            parentIc,
            snapshot
        );
        if (ic) {
            Preprocessor.addStringRanges(position, afterEndPosition, snapshot);
        }
    }

    private static createIncludeContext(
        position: number,
        afterEndPosition: number,
        uri: DocumentUri | null,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): IncludeContext | null {
        if (!uri) {
            return null;
        }
        const ic: IncludeContext = {
            startPosition: position,
            localStartPosition: position,
            endPosition: afterEndPosition,
            snapshot,
            parent: parentIc,
            children: [],
        };
        if (parentIc) {
            parentIc.children.push(ic);
        } else {
            snapshot.includeContexts.push(ic);
        }
        return ic;
    }

    private static async getIncludeText(
        uri: DocumentUri | null,
        parentIc: IncludeContext | null,
        snapshot: Snapshot
    ): Promise<string> {
        const circularInclude = HlslPreprocessor.isCircularInclude(
            parentIc,
            uri,
            snapshot
        );
        return uri && !circularInclude
            ? await HlslPreprocessor.getText(uri)
            : '';
    }

    private static async getText(uri: DocumentUri): Promise<string> {
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

    private static isCircularInclude(
        ic: IncludeContext | null,
        uri: DocumentUri | null,
        snapshot: Snapshot
    ): boolean {
        if (snapshot.uri === uri) {
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

    public static isDefined(
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

            const ma = Preprocessor.getMacroArguments(
                identifierEndPosition,
                snapshot
            );
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
            if (HlslPreprocessor.isCircularDefineExpansion(parentDc, ds)) {
                continue;
            }
            const beforeEndPosition = ma
                ? ma.endPosition
                : identifierEndPosition;
            if (Preprocessor.isInString(identifierStartPosition, snapshot)) {
                continue;
            }
            const macroSnapshot = new Snapshot(-1, '', '');
            macroSnapshot.text = ds.content;
            Preprocessor.addStringRanges(
                0,
                macroSnapshot.text.length,
                macroSnapshot
            );
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
                    while (
                        (regexResult = macroParameterRegex.exec(
                            macroSnapshot.text
                        ))
                    ) {
                        const parameterStartPosition = regexResult.index;
                        if (
                            Preprocessor.isInString(
                                parameterStartPosition,
                                macroSnapshot
                            )
                        ) {
                            continue;
                        }
                        const parameterMatch = regexResult[0];
                        const parameterBeforeEndPosition =
                            parameterStartPosition + parameterMatch.length;
                        if (regexResult.groups) {
                            const parameterName = regexResult.groups.name;
                            const stringification =
                                !!regexResult.groups.stringification;
                            const argument = ma
                                ? ma.arguments[
                                      ds.parameters.indexOf(parameterName)
                                  ]
                                : parameterName;
                            const replacement = stringification
                                ? HlslPreprocessor.stringify(argument)
                                : argument;
                            const parameterAfterEndPosition =
                                parameterStartPosition + replacement.length;
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
                const regex = /[ \t]*#[ \t]*#[ \t]*/g;
                let regexResult: RegExpExecArray | null;
                while ((regexResult = regex.exec(macroSnapshot.text))) {
                    const position = regexResult.index;
                    if (Preprocessor.isInString(position, macroSnapshot)) {
                        continue;
                    }
                    const match = regexResult[0];
                    const beforeEndPosition = position + match.length;
                    Preprocessor.changeTextAndAddOffset(
                        position,
                        beforeEndPosition,
                        position,
                        '',
                        macroSnapshot
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

                const afterEndPosition =
                    identifierStartPosition + macroSnapshot.text.length;
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
                Preprocessor.addStringRanges(
                    identifierStartPosition,
                    afterEndPosition,
                    snapshot
                );
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
                HlslPreprocessor.expandMacros(
                    fromPosition,
                    toPosition,
                    snapshot,
                    macroNames
                );
            } else {
                const afterEndPosition =
                    identifierStartPosition + macroSnapshot.text.length;
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
                Preprocessor.addStringRanges(
                    identifierStartPosition,
                    afterEndPosition,
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

    private static stringify(argument: string): string {
        const argumentSnapshot = new Snapshot(-1, '', '');
        argumentSnapshot.text = argument;
        Preprocessor.addStringRanges(0, argument.length, argumentSnapshot);
        const regex = /"|\\/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(argumentSnapshot.text))) {
            const position = regexResult.index;
            const quote = regexResult[0] === '"';
            if (quote || Preprocessor.isInString(position, argumentSnapshot)) {
                Preprocessor.changeTextAndAddOffset(
                    position,
                    position,
                    position + 2,
                    '\\',
                    argumentSnapshot
                );
                regex.lastIndex = position + 2;
            }
        }
        return `"${argumentSnapshot.text}"`;
    }

    private static isCircularDefineExpansion(
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
}
