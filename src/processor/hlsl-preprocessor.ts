import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';

import { ConditionLexer } from '../_generated/ConditionLexer';
import { ConditionParser } from '../_generated/ConditionParser';
import { Snapshot } from '../core/snapshot';
import { DefineStatement } from '../interface/define-statement';
import { IncludeContext } from '../interface/include-context';
import { IncludeStatement } from '../interface/include-statement';
import { IncludeType } from '../interface/include-type';
import { ConditionVisitor } from './condition-visitor';
import {
    addPreprocessingOffset,
    changeText,
    preprocessIncludeStatement,
} from './preprocessor';

export async function preprocessHlsl(snapshot: Snapshot): Promise<void> {
    return await new HlslPreprocessor(snapshot).preprocess();
}

type IfState = { position: number; condition: boolean; already: boolean };

class HlslPreprocessor {
    private snapshot: Snapshot;
    private ifStack: IfState[] = [];

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
            await this.preprocessDirective(position, beforeEndPosition, match);
            regex.lastIndex = position;
        }
    }

    private async preprocessDirective(
        position: number,
        beforeEndPosition: number,
        match: string
    ): Promise<void> {
        const is2 = this.getIfdefStatement(match, position);
        if (is2) {
            this.ifStack.push(is2);
            this.removeSection(position, beforeEndPosition);
            return;
        }
        const is4 = this.getIfStatement(match, position);
        if (is4) {
            this.ifStack.push(is4);
            this.removeSection(position, beforeEndPosition);
            return;
        }
        const is5 = this.getElifStatement(match, position);
        if (is5) {
            const oldIs = this.ifStack.pop();
            if (oldIs && !oldIs.condition) {
                this.removeSection(oldIs.position, beforeEndPosition);
            } else {
                this.removeSection(position, beforeEndPosition);
            }
            this.ifStack.push(is5);
            return;
        }
        const es = this.getElseStatement(match, position);
        if (es) {
            const oldIs = this.ifStack.pop();
            if (oldIs && !oldIs.condition) {
                this.removeSection(oldIs.position, beforeEndPosition);
            } else {
                this.removeSection(position, beforeEndPosition);
            }
            this.ifStack.push(es);
            return;
        }
        if (this.isEndifStatement(match)) {
            const is3 = this.ifStack.pop();
            if (is3 && !is3.condition) {
                this.removeSection(is3.position, beforeEndPosition);
            } else {
                this.removeSection(position, beforeEndPosition);
            }
            return;
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
            return;
        }
        const ds = this.getDefineStatement(match, position);
        if (ds) {
            this.removeSection(position, beforeEndPosition);
            return;
        }
        if (this.isUndefStatement(match, position)) {
            this.removeSection(position, beforeEndPosition);
            return;
        }
        this.removeSection(position, beforeEndPosition);
        // TODO: find all strings
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
        const regexResult = regex.exec(text);
        if (regexResult && regexResult.groups) {
            const condition = this.evaluateCondition(
                regexResult.groups.condition,
                position
            );
            const is: IfState = {
                position: regexResult.index + position,
                condition,
                already: condition,
            };
            return is;
        }
        return null;
    }

    private getElifStatement(text: string, position: number): IfState | null {
        const regex = /#\s*?elif\b(?<condition>.*?)(?=\n|$)/;
        const regexResult = regex.exec(text);
        if (regexResult && regexResult.groups) {
            const last = this.ifStack[this.ifStack.length - 1];
            const condition =
                !(last?.already ?? false) &&
                this.evaluateCondition(regexResult.groups.condition, position);
            const is: IfState = {
                position: last?.condition ?? true ? position : last.position,
                condition,
                already: last?.already || condition,
            };
            return is;
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
            };
            return is;
        }
        return null;
    }

    private getDefineStatement(
        text: string,
        position: number
    ): DefineStatement | null {
        let regex =
            /#\s*?define\s+?(?<name>[a-zA-Z_]\w*?)(?<content>[^(].*?)?(?=\n|$)/;
        let regexResult = regex.exec(text);
        if (regexResult && regexResult.groups) {
            const name = regexResult.groups.name;
            const content = regexResult.groups.content?.trim() ?? '';
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
