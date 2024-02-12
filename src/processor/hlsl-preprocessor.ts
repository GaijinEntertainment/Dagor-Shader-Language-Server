import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { DocumentUri, Range } from 'vscode-languageserver';

import { ConditionLexer } from '../_generated/ConditionLexer';
import { ConditionParser } from '../_generated/ConditionParser';
import { HLSLI_EXTENSION, HLSL_EXTENSION } from '../core/constant';
import { Snapshot } from '../core/snapshot';
import { isIntervalContains } from '../helper/helper';
import { Arguments } from '../interface/arguments';
import { DefineContext } from '../interface/define-context';
import { DefineStatement } from '../interface/define-statement';
import { ElementRange } from '../interface/element-range';
import { HlslBlock } from '../interface/hlsl-block';
import { IfState } from '../interface/if-state';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { MacroContext } from '../interface/macro/macro-context';
import { ShaderBlock } from '../interface/shader-block';
import { invalidVersion } from '../interface/snapshot-version';
import { TextEdit } from '../interface/text-edit';
import { ConditionVisitor } from './condition-visitor';
import { getIncludedDocumentUri } from './include-resolver';
import { Preprocessor } from './preprocessor';

export async function preprocessHlsl(snapshot: Snapshot): Promise<void> {
    return await new HlslPreprocessor(snapshot).preprocess();
}

export class HlslPreprocessor {
    private snapshot: Snapshot;
    private ifStack: IfState[][] = [];
    private textEdits: TextEdit[] = [];

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
    }

    public async preprocess(): Promise<void> {
        await this.preprocessDirectives();
        this.expandDefines();
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
        Preprocessor.executeTextEdits(this.textEdits, this.snapshot, false);
    }

    private async preprocessDirective(position: number, beforeEndPosition: number, match: string): Promise<number> {
        let regexResult = /#[ \t]*include[ \t]*(?:"(?<quotedPath>(?:\\"|[^"])*)"|<(?<angularPath>[^>]*)>)/.exec(match);
        if (regexResult) {
            return await this.preprocessInclude(regexResult, position);
        }
        const ifRegex = /(?<beforeCondition>^#[ \t]*if\b[ \t]*)(?<condition>.*)/;
        regexResult = ifRegex.exec(match);
        if (regexResult) {
            this.preprocessIf(regexResult, position);
            return beforeEndPosition;
        }
        const ifdefRegex = /(?<beforeCondition>#[ \t]*(?<directive>ifn?def\b)[ \t]*)(?<condition>.*)/;
        regexResult = ifdefRegex.exec(match);
        if (regexResult) {
            this.preprocessIfdef(regexResult, position);
            return beforeEndPosition;
        }
        const elifRegex = /(?<beforeCondition>^#[ \t]*elif\b[ \t]*)(?<condition>.*)/;
        regexResult = elifRegex.exec(match);
        if (regexResult) {
            this.preprocessElif(regexResult, position);
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
        if (!this.isAnyFalseAbove(true)) {
            const functionDefineRegex =
                /(?<beforeName>#[ \t]*define[ \t]+)(?<name>[a-zA-Z_]\w*)\((?<params>[ \t]*[a-zA-Z_]\w*(?:[ \t]*,[ \t]*[a-zA-Z_]\w*)*[ \t]*,?)?[ \t]*\)(?<content>.*)?/;
            regexResult = functionDefineRegex.exec(match);
            if (regexResult) {
                this.preprocessFunctionDefine(regexResult, position);
                return beforeEndPosition;
            }
            const objectDefineRegex = /(?<beforeName>#[ \t]*define[ \t]+)(?<name>[a-zA-Z_]\w*)[ \t]*(?<content>.*)?/;
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
        const ic = this.createIncludeContext(position, afterEndPosition, uri, parentIc, is, includeSnapshot);
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
        is: IncludeStatement,
        includeSnapshot: Snapshot
    ): IncludeContext | null {
        if (!uri) {
            return null;
        }
        const ic: IncludeContext = {
            startPosition: position,
            localStartPosition: position,
            endPosition: afterEndPosition,
            includeStatement: is,
            snapshot: includeSnapshot,
            parent: parentIc,
            children: [],
            uri,
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

    private preprocessIf(regexResult: RegExpExecArray, offset: number): void {
        const ifState: IfState = { position: offset, condition: false };
        this.ifStack.push([ifState]);
        if (!this.isAnyFalseAbove()) {
            this.setCondition(regexResult, offset, ifState);
        }
        this.snapshot.directives.push({ startPosition: offset, endPosition: offset + regexResult[0].length });
    }

    private preprocessIfdef(regexResult: RegExpExecArray, offset: number): void {
        const ifState: IfState = { position: offset, condition: false };
        this.ifStack.push([ifState]);
        if (!this.isAnyFalseAbove() && regexResult.groups) {
            const position = offset + regexResult.index;
            const directive = regexResult.groups.directive;
            const condition = regexResult.groups.condition.trim();
            const ds = this.snapshot.getDefinition(condition, position);
            if (ds) {
                const conditionPosition = position + (regexResult.groups.beforeCondition?.length ?? 0);
                const endPosition = conditionPosition + condition.length;
                HlslPreprocessor.createDefineContext(
                    conditionPosition,
                    endPosition,
                    endPosition,
                    this.snapshot.getOriginalRange(conditionPosition, endPosition),
                    ds,
                    this.snapshot,
                    !this.snapshot.isInIncludeContext(position) && !this.snapshot.isInMacroContext(position),
                    null
                );
            }
            let defined = !!ds;
            if (directive === 'ifndef') {
                defined = !defined;
            }
            ifState.condition = defined;
        }
        this.snapshot.directives.push({ startPosition: offset, endPosition: offset + regexResult[0].length });
    }

    private preprocessElif(regexResult: RegExpExecArray, offset: number): void {
        const ifState: IfState = { position: offset, condition: false };
        HlslPreprocessor.addIfFoldingRange(offset, this.ifStack, this.snapshot);
        if (!this.isAnyFalseAbove() && this.isAllFalseInTheSameLevel()) {
            this.setCondition(regexResult, offset, ifState);
        }
        HlslPreprocessor.addIfState(this.ifStack, ifState);
        this.snapshot.directives.push({ startPosition: offset, endPosition: offset + regexResult[0].length });
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
            this.addDirectiveTextEdits(position);
        }
        this.ifStack.pop();
    }

    private setCondition(regexResult: RegExpExecArray, offset: number, ifState: IfState): void {
        const position = offset + regexResult.index;
        const match = regexResult[0];
        const conditionPosition = position + (regexResult.groups?.beforeCondition?.length ?? 0);
        const defines = this.snapshot.getDefineStatements(position);
        let text = regexResult.groups?.condition ?? '';
        if (defines.length) {
            const snapshot = new Snapshot(invalidVersion, text, '');
            snapshot.text = text;
            const definesMap = this.createDefinesMap(defines);
            this.snapshot.stringRanges.forEach((sr) => {
                if (sr.endPosition >= position && sr.startPosition <= position + match.length) {
                    snapshot.stringRanges.push({
                        startPosition: sr.startPosition - position,
                        endPosition: sr.endPosition - position,
                    });
                }
            });
            this.expandAll(definesMap, defines, [], snapshot, conditionPosition);
            text = snapshot.text;
        }
        ifState.condition = this.evaluateCondition(text, conditionPosition);
    }

    private createDefinesMap(defines: DefineStatement[]): Map<string, DefineStatement[]> {
        const definesMap = new Map<string, DefineStatement[]>();
        for (const ds of defines) {
            let dss = definesMap.get(ds.name);
            if (!dss) {
                dss = [];
                definesMap.set(ds.name, dss);
            }
            dss.push(ds);
        }
        return definesMap;
    }

    private addDirectiveTextEdits(position: number): void {
        if (this.ifStack.length) {
            const ifStates = this.ifStack[this.ifStack.length - 1];
            let lastPosition = -1;
            for (const ifState of ifStates) {
                if (ifState.condition) {
                    if (lastPosition !== -1) {
                        this.textEdits.push({
                            startPosition: lastPosition,
                            endPosition: ifState.position,
                            newText: '',
                        });
                    }
                    lastPosition = -1;
                } else {
                    if (lastPosition === -1) {
                        lastPosition = ifState.position;
                    }
                }
            }
            if (lastPosition !== -1) {
                this.textEdits.push({ startPosition: lastPosition, endPosition: position, newText: '' });
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
            const beforeName = position + regexResult.groups.beforeName.length;
            const name = regexResult.groups.name;
            const match = regexResult[0];
            const ic = this.snapshot.getIncludeContextDeepAt(position);
            const mc = this.snapshot.getMacroContextDeepAt(position);
            const isVisible = !ic && !mc;
            this.createDefineStatement(
                position,
                beforeName,
                match,
                name,
                objectLike,
                parameters,
                content,
                isVisible,
                this.snapshot,
                ic,
                mc
            );
        }
    }

    private createDefineStatement(
        position: number,
        beforeName: number,
        match: string,
        name: string,
        objectLike: boolean,
        parameters: string[],
        content: string,
        isVisible: boolean,
        snapshot: Snapshot,
        ic: IncludeContext | null,
        mc: MacroContext | null
    ): DefineStatement {
        const realDefine =
            mc?.macroDeclaration?.contentSnapshot?.defineStatements?.find((ds) => ds.name === name) ?? null;
        const originalRange = this.snapshot.getOriginalRange(position, position + match.length);
        const nameOriginalRange = this.snapshot.getOriginalRange(beforeName, beforeName + name.length);
        const ds: DefineStatement = {
            objectLike,
            position,
            endPosition: position + match.length,
            originalRange,
            nameOriginalRange,
            name,
            parameters,
            content,
            undefPosition: null,
            codeCompletionPosition: ic ? ic.includeStatement.originalEndPosition : nameOriginalRange.end,
            undefCodeCompletionPosition: null,
            isVisible,
            usages: [],
            uri: mc?.macroDeclaration?.uri ?? ic?.uri ?? snapshot.uri,
            realDefine,
        };
        this.addDefine(position, ds, snapshot);
        return ds;
    }

    private addDefine(position: number, ds: DefineStatement, snapshot: Snapshot): void {
        snapshot.defineStatements.push(ds);
        const shaderBlock = snapshot.shaderBlocks.find(
            (sb) => sb.startPosition <= position && position <= sb.endPosition
        );
        if (shaderBlock) {
            this.addDefineToHlslBlock(position, shaderBlock.hlslBlocks, ds);
        } else {
            this.addDefineToHlslBlock(position, snapshot.globalHlslBlocks, ds);
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

    public addHlslDirectivesInMacro(snapshot: Snapshot, offset: number): void {
        const regex = /#.*/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(snapshot.text))) {
            let position = regexResult.index;
            if (Preprocessor.isInString(position, snapshot)) {
                continue;
            }
            const match = regexResult[0];
            const includeRegex = /#[ \t]*include[ \t]*(?:"(?<quotedPath>(?:\\"|[^"])*)"|<(?<angularPath>[^>]*)>)/;
            regexResult = includeRegex.exec(match);
            if (regexResult) {
                position += offset + regexResult.index;
                this.preprocessIncludeLight(regexResult, position);
                continue;
            }
            const ifRegex = /^#[ \t]*if\b.*/;
            regexResult = ifRegex.exec(match);
            if (regexResult) {
                position += offset + regexResult.index;
                this.preprocessIfIfdefLight(position);
                continue;
            }
            const ifdefRegex = /#[ \t]*ifn?def\b.*/;
            regexResult = ifdefRegex.exec(match);
            if (regexResult) {
                position += offset + regexResult.index;
                this.preprocessIfIfdefLight(position);
                continue;
            }
            const elifRegex = /^#[ \t]*elif\b.*/;
            regexResult = elifRegex.exec(match);
            if (regexResult) {
                position += offset + regexResult.index;
                this.preprocessElifElseLight(position);
                continue;
            }
            const elseRegex = /^#[ \t]*else\b.*/;
            regexResult = elseRegex.exec(match);
            if (regexResult) {
                position += offset + regexResult.index;
                this.preprocessElifElseLight(position);
                continue;
            }
            const endifRegex = /^#[ \t]*endif\b.*/;
            regexResult = endifRegex.exec(match);
            if (regexResult) {
                position += offset + regexResult.index;
                this.preprocessEndifLight(position);
                continue;
            }
            const functionDefineRegex =
                /(?<beforeName>#[ \t]*define[ \t]+)(?<name>[a-zA-Z_]\w*)\((?<params>[ \t]*[a-zA-Z_]\w*(?:[ \t]*,[ \t]*[a-zA-Z_]\w*)*[ \t]*,?)?[ \t]*\).*/;
            regexResult = functionDefineRegex.exec(match);
            if (regexResult) {
                position += offset + regexResult.index;
                this.preprocessFunctionDefineLight(regexResult, position, snapshot);
                continue;
            }
            const objectDefineRegex = /(?<beforeName>#[ \t]*define[ \t]+)(?<name>[a-zA-Z_]\w*)[ \t]*.*/;
            regexResult = objectDefineRegex.exec(match);
            if (regexResult) {
                position += offset + regexResult.index;
                this.preprocessObjectDefineLight(regexResult, position, snapshot);
                continue;
            }
        }
    }

    private preprocessIncludeLight(regexResult: RegExpExecArray, position: number): void {
        const match = regexResult[0];
        const beforeEndPosition = position + match.length;
        const path = regexResult.groups?.quotedPath ?? regexResult.groups?.angularPath ?? '';
        const type = regexResult.groups?.quotedPath ? IncludeType.HLSL_QUOTED : IncludeType.HLSL_ANGULAR;
        Preprocessor.createIncludeStatement(beforeEndPosition, type, path, false, null, this.snapshot);
    }

    private preprocessIfIfdefLight(position: number): void {
        const ifState: IfState = { position, condition: false };
        this.ifStack.push([ifState]);
    }

    private preprocessElifElseLight(position: number): void {
        const ifState: IfState = { position, condition: false };
        HlslPreprocessor.addIfFoldingRange(position, this.ifStack, this.snapshot);
        HlslPreprocessor.addIfState(this.ifStack, ifState);
    }

    private preprocessEndifLight(position: number): void {
        HlslPreprocessor.addIfFoldingRange(position, this.ifStack, this.snapshot);
        this.ifStack.pop();
    }

    private preprocessFunctionDefineLight(regexResult: RegExpExecArray, position: number, snapshot: Snapshot): void {
        const parameters =
            regexResult.groups?.params
                ?.replace(/[ \t]/g, '')
                .split(',')
                .filter((p) => p.length) ?? [];
        const beforeName = position + (regexResult.groups?.beforeName?.length ?? 0);
        const name = regexResult.groups?.name ?? '';
        const match = regexResult[0];
        this.createDefineStatement(
            position,
            beforeName,
            match,
            name,
            false,
            parameters,
            '',
            true,
            snapshot,
            null,
            null
        );
    }

    private preprocessObjectDefineLight(regexResult: RegExpExecArray, position: number, snapshot: Snapshot): void {
        const beforeName = position + (regexResult.groups?.beforeName?.length ?? 0);
        const name = regexResult.groups?.name ?? '';
        const match = regexResult[0];
        this.createDefineStatement(position, beforeName, match, name, true, [], '', true, snapshot, null, null);
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

    private expandDefines(): void {
        this.textEdits = [];
        if (this.snapshot.uri.endsWith(HLSL_EXTENSION) || this.snapshot.uri.endsWith(HLSLI_EXTENSION)) {
            const definesMap = this.createDefinesMap(this.snapshot.defineStatements);
            const tes = this.expandAll(definesMap, this.snapshot.defineStatements, [], this.snapshot, 0, true);
            this.textEdits.push(...tes);
        } else {
            this.expandGlobalHlslBlocks();
            this.expandShaderHlslBlocks();
        }
        Preprocessor.executeTextEdits(this.textEdits, this.snapshot, false);
    }

    private expandGlobalHlslBlocks(): void {
        this.expandHlslBlocks(this.snapshot.globalHlslBlocks, null);
    }

    private expandShaderHlslBlocks(): void {
        for (const sb of this.snapshot.shaderBlocks) {
            this.expandHlslBlocks(sb.hlslBlocks, sb);
        }
    }

    private expandHlslBlocks(hbs: HlslBlock[], sb: ShaderBlock | null): void {
        for (const hb of hbs) {
            const defines = this.getDefineStatementsInHlslBlock(hb, sb);
            if (!defines.length) {
                continue;
            }
            const text = this.snapshot.text.substring(hb.startPosition, hb.endPosition);
            const definesMap = this.createDefinesMap(defines);
            const snapshot = new Snapshot(invalidVersion, text, '');
            snapshot.text = text;
            snapshot.stringRanges.push(
                ...this.snapshot.stringRanges
                    .filter((sr) => sr.startPosition >= hb.startPosition && sr.endPosition <= hb.endPosition)
                    .map((sr) => ({
                        startPosition: sr.startPosition - hb.startPosition,
                        endPosition: sr.endPosition - hb.startPosition,
                    }))
            );
            const tes = this.expandAll(definesMap, hb.defineStatements, [], snapshot, hb.startPosition, true);
            tes.forEach((te) => {
                te.startPosition += hb.startPosition;
                te.endPosition += hb.startPosition;
            });
            this.textEdits.push(...tes);
        }
    }

    private expandAll(
        definesMap: Map<string, DefineStatement[]>,
        defines: DefineStatement[],
        expansions: DefineStatement[],
        snapshot: Snapshot,
        offset: number,
        isTopLevel = false
    ): TextEdit[] {
        const textEdits: TextEdit[] = [];
        const identifierRegex = /\b([a-zA-Z_]\w*)\b/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = identifierRegex.exec(snapshot.text))) {
            const localPosition = regexResult.index;
            const globalPosition = localPosition + offset;
            if (Preprocessor.isInString(localPosition, snapshot) || this.snapshot.isInDirective(globalPosition)) {
                continue;
            }
            if (defines.some((ds) => isIntervalContains(ds.position, ds.endPosition, globalPosition))) {
                continue;
            }
            const identifier = regexResult[0];
            const dss = definesMap
                .get(identifier)
                ?.filter(
                    (ds) =>
                        ds.endPosition <= globalPosition &&
                        (ds.undefPosition == null || ds.undefPosition > globalPosition)
                );
            if (!dss?.length) {
                continue;
            }
            const identifierEndPosition = localPosition + identifier.length;
            const da = Preprocessor.getArguments(identifierEndPosition, snapshot);
            const ds =
                dss.find(
                    (ds) => (!!da && !ds.objectLike && ds.parameters.length === da.arguments.length) || ds.objectLike
                ) ?? null;
            if (!ds || expansions.includes(ds)) {
                continue;
            }

            const beforeEndPosition = da ? da.endPosition : identifierEndPosition;
            const macroSnapshot = new Snapshot(invalidVersion, '', '');
            snapshot.stringRanges.forEach((sr) => {
                if (sr.startPosition >= localPosition && sr.endPosition <= beforeEndPosition) {
                    macroSnapshot.stringRanges.push({
                        startPosition: sr.startPosition - localPosition,
                        endPosition: sr.endPosition - localPosition,
                    });
                }
            });
            macroSnapshot.text = snapshot.text.substring(localPosition, beforeEndPosition);
            const te = this.expandSpecific(
                localPosition,
                globalPosition,
                macroSnapshot,
                definesMap,
                defines,
                [ds, ...expansions],
                ds,
                da
            );
            textEdits.push(te);
            if (expansions.length === 0) {
                const beforeEndPosition = globalPosition + te.newText.length;
                const afterEndPosition = globalPosition + macroSnapshot.text.length;
                const nameOriginalRange = this.snapshot.getOriginalRange(
                    globalPosition,
                    globalPosition + identifier.length
                );
                if (da) {
                    this.computeOriginalArgumentPositions(da, offset);
                }
                const isVisible =
                    expansions.length === 0 &&
                    !this.snapshot.isInIncludeContext(globalPosition) &&
                    !this.snapshot.isInMacroContext(globalPosition);
                HlslPreprocessor.createDefineContext(
                    globalPosition,
                    beforeEndPosition,
                    afterEndPosition,
                    nameOriginalRange,
                    ds,
                    this.snapshot,
                    isVisible,
                    te.newText,
                    da
                );
            }
            identifierRegex.lastIndex = beforeEndPosition;
        }
        if (!isTopLevel) {
            Preprocessor.executeTextEdits(textEdits, snapshot, false);
        }
        return textEdits;
    }

    private computeOriginalArgumentPositions(da: Arguments, offset: number): void {
        da.argumentListOriginalRange = this.snapshot.getOriginalRange(
            offset + da.argumentListPosition,
            offset + da.argumentListEndPosition
        );
        for (const maa of da.arguments) {
            maa.originalRange = this.snapshot.getOriginalRange(offset + maa.position, offset + maa.endPosition);
            maa.trimmedOriginalStartPosition = this.snapshot.getOriginalPosition(
                offset + maa.trimmedStartPosition,
                true
            );
        }
    }

    private expandSpecific(
        localPosition: number,
        globalPosition: number,
        snapshot: Snapshot,
        definesMap: Map<string, DefineStatement[]>,
        defines: DefineStatement[],
        expansions: DefineStatement[],
        ds: DefineStatement,
        da: Arguments | null
    ): TextEdit {
        const beforeEndPosition = snapshot.text.length;
        snapshot.text = ds.content;
        Preprocessor.addStringRanges(0, snapshot.text.length, snapshot);
        if (da) {
            let parameterReplacements: ElementRange[] = [];
            if (ds.parameters.length) {
                this.parameterReplacement(snapshot, ds, da, parameterReplacements);
            }
            this.concatenation(snapshot, parameterReplacements);
            parameterReplacements = this.mergeParameterReplacements(parameterReplacements);
            this.expandParameters(globalPosition, snapshot, definesMap, defines, expansions, parameterReplacements);
        }
        this.expandAll(definesMap, defines, expansions, snapshot, globalPosition);
        return {
            newText: snapshot.text,
            startPosition: localPosition,
            endPosition: localPosition + beforeEndPosition,
        };
    }

    private parameterReplacement(
        snapshot: Snapshot,
        ds: DefineStatement,
        da: Arguments,
        parameterReplacements: ElementRange[]
    ): void {
        const textEdits: TextEdit[] = [];
        const parameterNames = ds.parameters.join('|');
        const macroParameterRegex = new RegExp(
            `(?<![^# \\t][ \\t]*#[ \\t]*)((?<stringification>#)[ \\t]*)?\\b(?<name>${parameterNames})\\b`,
            'g'
        );
        let regexResult: RegExpExecArray | null;
        let offset = 0;
        while ((regexResult = macroParameterRegex.exec(snapshot.text))) {
            const parameterStartPosition = regexResult.index;
            if (Preprocessor.isInString(parameterStartPosition, snapshot)) {
                continue;
            }
            const parameterMatch = regexResult[0];
            const parameterBeforeEndPosition = parameterStartPosition + parameterMatch.length;
            if (regexResult.groups) {
                const parameterName = regexResult.groups.name;
                const stringification = !!regexResult.groups.stringification;
                const argument = da ? da.arguments[ds.parameters.indexOf(parameterName)].content : parameterName;
                const replacement = stringification ? this.stringify(argument) : argument;
                const parameterAfterEndPosition = parameterStartPosition + replacement.length;
                textEdits.push({
                    newText: replacement,
                    startPosition: parameterStartPosition,
                    endPosition: parameterBeforeEndPosition,
                });
                if (!stringification) {
                    parameterReplacements.push({
                        startPosition: offset + parameterStartPosition,
                        endPosition: offset + parameterAfterEndPosition,
                    });
                }
                offset += replacement.length - parameterName.length;
            }
        }
        Preprocessor.executeTextEdits(textEdits, snapshot, true);
    }

    private concatenation(snapshot: Snapshot, parameterReplacements: ElementRange[]): void {
        const textEdits: TextEdit[] = [];
        const regex = /[ \t]*#[ \t]*#[ \t]*/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(snapshot.text))) {
            const position = regexResult.index;
            if (Preprocessor.isInString(position, snapshot)) {
                continue;
            }
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            textEdits.push({
                newText: '',
                startPosition: position,
                endPosition: beforeEndPosition,
            });
            for (const r of parameterReplacements) {
                if (position < r.startPosition) {
                    r.startPosition -= match.length;
                    r.endPosition -= match.length;
                }
            }
        }
        Preprocessor.executeTextEdits(textEdits, snapshot, false);
    }

    private mergeParameterReplacements(parameterReplacements: ElementRange[]): ElementRange[] {
        for (let i = 0; i < parameterReplacements.length; i++) {
            for (let j = 0; j < parameterReplacements.length; j++) {
                if (i !== j && parameterReplacements[i].endPosition === parameterReplacements[j].startPosition) {
                    parameterReplacements[i].endPosition = parameterReplacements[j].endPosition;
                    parameterReplacements[j].startPosition = -1;
                    parameterReplacements[j].endPosition = -1;
                }
            }
        }
        return parameterReplacements.filter((r) => r.startPosition >= 0);
    }

    private expandParameters(
        globalPosition: number,
        snapshot: Snapshot,
        definesMap: Map<string, DefineStatement[]>,
        defines: DefineStatement[],
        expansions: DefineStatement[],
        parameterReplacements: ElementRange[]
    ): void {
        const textEdits: TextEdit[] = [];
        for (const replacement of parameterReplacements) {
            if (Preprocessor.isInString(replacement.startPosition, snapshot)) {
                continue;
            }
            const replacementSnapshot = new Snapshot(invalidVersion, '', '');
            replacementSnapshot.text = snapshot.text.substring(replacement.startPosition, replacement.endPosition);
            const tes = this.expandAll(
                definesMap,
                defines,
                expansions,
                replacementSnapshot,
                globalPosition + replacement.startPosition
            );
            tes.forEach((te) => {
                te.startPosition += replacement.startPosition;
                te.endPosition += replacement.startPosition;
            });
            textEdits.push(...tes);
        }
        Preprocessor.executeTextEdits(textEdits, snapshot, true);
    }

    private getDefineStatementsInHlslBlock(hb: HlslBlock, sb: ShaderBlock | null): DefineStatement[] {
        const result = this.snapshot.globalHlslBlocks
            .filter((h) => (h.stage === hb.stage || h.stage === null) && h.endPosition <= hb.endPosition)
            .flatMap((h) => h.defineStatements);
        if (sb) {
            result.push(
                ...sb.hlslBlocks
                    .filter((h) => (h.stage === hb.stage || h.stage === null) && h.endPosition <= hb.endPosition)
                    .flatMap((h) => h.defineStatements)
            );
        }
        return result;
    }

    private stringify(argument: string): string {
        const argumentSnapshot = new Snapshot(invalidVersion, '', '');
        argumentSnapshot.text = argument;
        Preprocessor.addStringRanges(0, argument.length, argumentSnapshot);
        const textEdits: TextEdit[] = [];
        const regex = /"|\\/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(argumentSnapshot.text))) {
            const position = regexResult.index;
            const quote = regexResult[0] === '"';
            if (quote || Preprocessor.isInString(position, argumentSnapshot)) {
                textEdits.push({
                    startPosition: position,
                    endPosition: position,
                    newText: '\\',
                });
            }
        }
        Preprocessor.executeTextEdits(textEdits, argumentSnapshot, false);
        return `"${argumentSnapshot.text}"`;
    }

    public static createDefineContext(
        position: number,
        beforeEndPosition: number,
        afterEndPosition: number,
        nameOriginalRange: Range,
        ds: DefineStatement,
        snapshot: Snapshot,
        isVisible: boolean,
        expansion: string | null,
        da: Arguments | null = null
    ): DefineContext {
        const dc: DefineContext = {
            define: ds,
            expansion,
            startPosition: position,
            beforeEndPosition,
            afterEndPosition,
            nameOriginalRange,
            isVisible,
            arguments: da,
        };
        snapshot.defineContexts.push(dc);
        if (ds.realDefine) {
            ds.realDefine.usages.push(dc);
        }
        ds.usages.push(dc);
        return dc;
    }
}
