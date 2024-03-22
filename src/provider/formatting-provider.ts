import { Token } from 'antlr4ts';
import {
    DocumentFormattingParams,
    DocumentRangeFormattingParams,
    DocumentRangesFormattingParams,
    DocumentUri,
    FormattingOptions,
    Range,
    TextEdit,
} from 'vscode-languageserver';

import { DshlLexer } from '../_generated/DshlLexer';
import { getSnapshot } from '../core/document-manager';
import { Snapshot } from '../core/snapshot';
import { getEol } from '../helper/file-helper';
import { containsRange, createLexer, rangeContains } from '../helper/helper';
import { hlslBufferTypes, hlslTextureTypes } from '../helper/hlsl-info';
import { getDocuments } from '../helper/server-helper';

export async function documentFormattingProvider(
    params: DocumentFormattingParams
): Promise<TextEdit[] | undefined | null> {
    return new FormattingProvider(params.options, params.textDocument.uri).format();
}

export async function documentRangeFormattingProvider(
    params: DocumentRangeFormattingParams
): Promise<TextEdit[] | undefined | null> {
    return new FormattingProvider(params.options, params.textDocument.uri, [params.range]).format();
}

export async function documentRangesFormattingProvider(
    params: DocumentRangesFormattingParams
): Promise<TextEdit[] | undefined | null> {
    return new FormattingProvider(params.options, params.textDocument.uri, params.ranges).format();
}

class FormattingProvider {
    private uri: DocumentUri;
    private options: FormattingOptions;
    private ranges: Range[];
    private text = '';
    private result: TextEdit[] = [];

    private lastRealToken: number | null = null;
    private lastEvaluatedToken: number | null = null;
    private newLine: number[] = [];
    private forHeader = false;
    private forHeaderDepth = 0;
    private functionCall = false;
    private functionCallDepth = 0;
    private template = false;
    private templateDepth = 0;
    private stickyOperator = true;
    private enum = false;
    private depth = 0;

    public constructor(options: FormattingOptions, uri: DocumentUri, ranges: Range[] = []) {
        this.options = options;
        this.uri = uri;
        this.ranges = ranges;
    }

    public async format(): Promise<TextEdit[] | undefined | null> {
        const snapshot = await getSnapshot(this.uri);
        if (!snapshot) {
            return null;
        }
        const td = getDocuments().get(this.uri);
        if (!td) {
            return null;
        }
        this.text = td.getText();
        const lexer = createLexer(this.text);
        const tokens = lexer.getAllTokens();

        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];
            if (t.type === DshlLexer.SPACE || t.type === DshlLexer.TAB) {
                continue;
            } else if (t.type === DshlLexer.NEW_LINE) {
                this.handleNewLine(i);
            } else if (
                t.type === DshlLexer.SINGLE_LINE_COMMENT ||
                t.type === DshlLexer.MULTI_LINE_COMMENT ||
                t.type === DshlLexer.PREPROCESSOR ||
                t.type === DshlLexer.INCLUDE ||
                t.type === DshlLexer.LINE_CONTINUATION
            ) {
                this.handleEvaluated(tokens, i, snapshot);
            } else {
                this.handleRealToken(tokens, i);
            }
        }
        return this.result;
    }

    private handleNewLine(i: number): void {
        this.newLine.push(i);
    }

    private handleEvaluated(tokens: Token[], i: number, snapshot: Snapshot): void {
        if (this.newLine.length) {
            const newText = this.newLine.length > 1 ? getEol() : '';
            const t2 = tokens[this.newLine[this.newLine.length - 1]];
            if (this.lastEvaluatedToken !== null) {
                if (this.lastEvaluatedToken === this.lastRealToken) {
                    const t1 = tokens[this.lastEvaluatedToken];
                    this.addTextEdit(t1, t2, newText);
                } else {
                    const t1 = tokens[this.newLine[0]];
                    this.addTextEdit(t1, t2, newText);
                }
            } else {
                this.result.push({
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: t2.line - 1, character: t2.charPositionInLine },
                    },
                    newText,
                });
            }
        }
        const t = tokens[i];
        const range: Range = {
            start: { line: t.line - 1, character: t.charPositionInLine - 1 },
            end: { line: t.line - 1, character: t.charPositionInLine - 1 + (t.text?.length ?? 0) },
        };
        if (
            snapshot.hlslBlocks.some((hb) => hb.isVisible && rangeContains(range, hb.originalRange.end)) ||
            snapshot.macroDeclarations
                .map((md) => md.contentSnapshot)
                .some((cs) => cs.hlslBlocks.some((hb) => hb.isVisible && rangeContains(range, hb.originalRange.end)))
        ) {
            this.depth--;
        }
        this.newLine = [];
        this.lastEvaluatedToken = i;
    }

    private handleRealToken(tokens: Token[], i: number): void {
        const t2 = tokens[i];
        if (this.forHeader) {
            if (t2.type === DshlLexer.LRB) {
                this.forHeaderDepth++;
            } else if (t2.type === DshlLexer.RRB) {
                this.forHeaderDepth--;
                if (this.forHeaderDepth === 0) {
                    this.forHeader = false;
                }
            }
        }
        if (t2.type === DshlLexer.RCB || t2.type === DshlLexer.ENDMACRO) {
            this.depth--;
        }

        if (this.lastRealToken !== null) {
            const t1 = tokens[this.lastRealToken];
            if (
                !this.functionCall &&
                t1.type === DshlLexer.IDENTIFIER &&
                t1.text !== 'register' &&
                t2.type === DshlLexer.LRB
            ) {
                this.functionCall = true;
            }
            if (this.functionCall && t2.type === DshlLexer.LRB) {
                this.functionCallDepth++;
            }
            if (this.functionCall && t1.type === DshlLexer.RRB) {
                this.functionCallDepth--;
            }
            if (
                !this.template &&
                ((t1.type === DshlLexer.IDENTIFIER &&
                    t1.text &&
                    (hlslBufferTypes.map((bt) => bt.name).includes(t1.text) ||
                        hlslTextureTypes.map((bt) => bt.name).includes(t1.text) ||
                        t1.text === 'RayQuery')) ||
                    t1.type === DshlLexer.TEMPLATE) &&
                t2.type === DshlLexer.LAB
            ) {
                this.template = true;
            }
            if (this.template && t2.type === DshlLexer.LAB) {
                this.templateDepth++;
            }
            if (this.template && t1.type === DshlLexer.RAB) {
                this.templateDepth--;
            }
            if (this.lastEvaluatedToken === this.lastRealToken) {
                if (this.isNewLineNeeded(t1, t2)) {
                    this.addTextEdit(t1, t2, this.getNewLineText());
                } else if (this.isNothingNeeded(t1, t2)) {
                    this.addTextEdit(t1, t2, '');
                } else {
                    this.addTextEdit(t1, t2, ' ');
                }
            } else if (this.newLine.length) {
                const newLine = tokens[this.newLine[0]];
                this.addTextEdit(newLine, t2, this.getNewLineText());
            }
            if (this.functionCall && this.functionCallDepth === 0) {
                this.functionCall = false;
            }
            if (this.template && this.templateDepth === 0) {
                this.template = false;
            }
            this.stickyOperator =
                (t2.type === DshlLexer.ADD || t2.type === DshlLexer.SUBTRACT) &&
                t1.type !== DshlLexer.IDENTIFIER &&
                t1.type !== DshlLexer.RRB &&
                t1.type !== DshlLexer.RSB &&
                t1.type !== DshlLexer.INT_LITERAL &&
                t1.type !== DshlLexer.FLOAT_LITERAL &&
                t1.type !== DshlLexer.STRING_LITERAL &&
                t1.type !== DshlLexer.CHAR_LITERAL &&
                t1.type !== DshlLexer.BOOL_LITERAL;
        }
        if (
            t2.type === DshlLexer.LCB ||
            t2.type === DshlLexer.MACRO ||
            t2.type === DshlLexer.DEFINE_MACRO_IF_NOT_DEFINED
        ) {
            this.depth++;
        }
        if (t2.type === DshlLexer.FOR) {
            this.forHeader = true;
        } else if (t2.type === DshlLexer.ENUM) {
            this.enum = true;
        } else if (t2.type === DshlLexer.SEMICOLON) {
            this.enum = false;
        }
        this.newLine = [];
        this.lastEvaluatedToken = i;
        this.lastRealToken = i;
    }

    private getNewLineText(): string {
        let newLine = getEol();
        if (this.newLine.length > 1) {
            newLine += getEol();
        }
        return newLine + this.getIndentation();
    }

    private isNewLineNeeded(t1: Token, t2: Token): boolean {
        return (
            (t1.type === DshlLexer.SEMICOLON && !this.forHeader) ||
            (t2.type === DshlLexer.LCB && !!this.newLine.length) ||
            t1.type === DshlLexer.LCB ||
            (t1.type === DshlLexer.RCB &&
                t2.type !== DshlLexer.SEMICOLON &&
                (t2.type !== DshlLexer.ELSE || !!this.newLine.length)) ||
            t1.type === DshlLexer.ENDMACRO ||
            (t1.type === DshlLexer.RRB &&
                (t2.type === DshlLexer.IDENTIFIER || t2.type === DshlLexer.HLSL) &&
                this.functionCall &&
                this.functionCallDepth === 0) ||
            (t1.type == DshlLexer.RSB && t2.type === DshlLexer.IDENTIFIER) ||
            (t1.type !== DshlLexer.ELSE && t2.type === DshlLexer.IF) ||
            t2.type === DshlLexer.FOR ||
            t2.type === DshlLexer.WHILE ||
            t2.type === DshlLexer.DO ||
            t2.type === DshlLexer.SWITCH ||
            t2.type === DshlLexer.CASE ||
            t2.type === DshlLexer.DEFAULT ||
            t2.type === DshlLexer.ENDMACRO ||
            (t1.type === DshlLexer.RRB && t2.type === DshlLexer.LRB) ||
            t2.type === DshlLexer.STRUCT ||
            t2.type === DshlLexer.RCB ||
            (t1.type === DshlLexer.COMMA && this.enum)
        );
    }

    private isNothingNeeded(t1: Token, t2: Token): boolean {
        return (
            (t1.type === DshlLexer.IDENTIFIER && t2.type === DshlLexer.LRB) ||
            t2.type === DshlLexer.SEMICOLON ||
            t2.type === DshlLexer.COMMA ||
            t1.type === DshlLexer.DOT ||
            t2.type === DshlLexer.DOT ||
            t1.type === DshlLexer.AT ||
            t2.type === DshlLexer.AT ||
            t1.type === DshlLexer.LRB ||
            t2.type === DshlLexer.RRB ||
            t1.type === DshlLexer.LSB ||
            t2.type === DshlLexer.LSB ||
            t2.type === DshlLexer.RSB ||
            t1.type === DshlLexer.NOT ||
            t1.type === DshlLexer.BITWISE_NOT ||
            t1.type === DshlLexer.DOUBLE_COLON ||
            t2.type === DshlLexer.DOUBLE_COLON ||
            (this.template && (t1.type === DshlLexer.LAB || t2.type === DshlLexer.LAB || t2.type === DshlLexer.RAB)) ||
            ((t1.type === DshlLexer.INCREMENT || t1.type === DshlLexer.DECREMENT) &&
                (t2.type === DshlLexer.IDENTIFIER ||
                    t2.type === DshlLexer.LRB ||
                    t2.type === DshlLexer.RRB ||
                    t2.type === DshlLexer.SEMICOLON ||
                    t2.type === DshlLexer.COMMA)) ||
            ((t2.type === DshlLexer.INCREMENT || t2.type === DshlLexer.DECREMENT) &&
                (t1.type === DshlLexer.IDENTIFIER ||
                    t1.type === DshlLexer.LRB ||
                    t1.type === DshlLexer.RRB ||
                    t1.type === DshlLexer.RSB)) ||
            (this.stickyOperator &&
                (t1.type === DshlLexer.ADD || t1.type === DshlLexer.SUBTRACT) &&
                (t2.type === DshlLexer.IDENTIFIER ||
                    t2.type === DshlLexer.LRB ||
                    t2.type === DshlLexer.INT_LITERAL ||
                    t2.type === DshlLexer.FLOAT_LITERAL ||
                    t2.type === DshlLexer.STRING_LITERAL ||
                    t2.type === DshlLexer.CHAR_LITERAL ||
                    t2.type === DshlLexer.BOOL_LITERAL))
        );
    }

    private addTextEdit(t1: Token, t2: Token, newText: string): void {
        const range: Range = {
            start: { line: t1.line - 1, character: t1.charPositionInLine + (t1.text?.length ?? 0) },
            end: { line: t2.line - 1, character: t2.charPositionInLine },
        };
        if (
            (this.ranges.length === 0 || this.ranges.some((r) => containsRange(r, range))) &&
            this.text.substring(t1.stopIndex + 1, t2.startIndex) !== newText
        ) {
            this.result.push({
                range,
                newText,
            });
        }
    }

    private getIndentation(): string {
        if (this.options.insertSpaces) {
            return ' '.repeat(this.depth * this.options.tabSize);
        } else {
            return '\t'.repeat(this.depth);
        }
    }
}
