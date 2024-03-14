import { ParserRuleContext } from 'antlr4ts';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { Position, Range } from 'vscode-languageserver';
import {
    Dshl_assignmentContext,
    Dshl_assume_statementContext,
    Dshl_block_blockContext,
    Dshl_expressionContext,
    Dshl_function_callContext,
    Dshl_hlsl_blockContext,
    Dshl_interval_declarationContext,
    Dshl_shader_declarationContext,
    Dshl_statement_blockContext,
    Dshl_supports_statementContext,
    Dshl_variable_declarationContext,
    State_objectContext,
    Statement_blockContext,
    Type_declarationContext,
} from '../_generated/DshlParser';
import { DshlParserVisitor } from '../_generated/DshlParserVisitor';
import { Snapshot } from '../core/snapshot';
import { Scope } from '../helper/scope';
import { BlockDeclaration } from '../interface/block/block-declaration';
import { BlockUsage } from '../interface/block/block-usage';
import { FunctionArgument } from '../interface/function/function-argument';
import { FunctionDeclaration } from '../interface/function/function-declaration';
import { FunctionUsage } from '../interface/function/function-usage';
import { IntervalDeclaration } from '../interface/interval-declaration';
import { ShaderDeclaration } from '../interface/shader/shader-declaration';
import { ShaderUsage } from '../interface/shader/shader-usage';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';

export class DshlVisitor extends AbstractParseTreeVisitor<void> implements DshlParserVisitor<void> {
    private snapshot: Snapshot;
    private scope: Scope;
    private rootSnapshot?: Snapshot;
    private contentStartPosition?: Position;

    public constructor(snapshot: Snapshot, rootSnapshot?: Snapshot, contentStartPosition?: Position) {
        super();
        this.snapshot = snapshot;
        this.scope = snapshot.rootScope;
        this.rootSnapshot = rootSnapshot;
        this.contentStartPosition = contentStartPosition;
    }

    private isVisible(position: number): boolean {
        return !this.snapshot.isInIncludeContext(position) && !this.snapshot.isInMacroContext(position);
    }

    public visitStatement_block(ctx: Statement_blockContext): void {
        if (this.isVisible(ctx.start.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        this.visitChildren(ctx);
    }

    public visitType_declaration(ctx: Type_declarationContext): void {
        if (this.isVisible(ctx.LCB().symbol.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        this.visitChildren(ctx);
    }

    public visitState_object(ctx: State_objectContext): void {
        if (this.isVisible(ctx.LCB().symbol.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        this.visitChildren(ctx);
    }

    public visitDshl_statement_block(ctx: Dshl_statement_blockContext): void {
        if (this.isVisible(ctx.LCB().symbol.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        const scope = this.createScope(ctx);
        this.scope.children.push(scope);
        this.scope = scope;
        this.visitChildren(ctx);
        this.scope = scope.parent!;
    }

    private getRange(startPosition: number, endPosition: number): Range {
        const ic = this.snapshot.getIncludeContextAt(startPosition);
        if (ic) {
            return ic.originalRange;
        }
        const mc = this.snapshot.getMacroContextAt(startPosition);
        if (mc) {
            return mc.originalRange;
        }
        const dc = this.snapshot.getDefineContextAt(startPosition);
        if (dc) {
            return dc.originalRange;
        }
        return this.snapshot.getOriginalRange(startPosition, endPosition);
    }

    public visitDshl_hlsl_block(ctx: Dshl_hlsl_blockContext): void {
        if (this.isVisible(ctx.LCB().symbol.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        this.visitChildren(ctx);
    }

    public visitDshl_variable_declaration(ctx: Dshl_variable_declarationContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        const type = ctx.IDENTIFIER(0);
        const identifier = ctx.IDENTIFIER(1);
        const nameOriginalRange = this.snapshot.getOriginalRange(
            identifier.symbol.startIndex,
            identifier.symbol.stopIndex + 1
        );
        const vd: VariableDeclaration = {
            type: type.text,
            name: identifier.text,
            nameEndPosition: ctx.stop!.stopIndex + 1,
            originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
            nameOriginalRange,
            uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
            isVisible: visible,
            usages: [],
        };
        // if (visible && identifier.text.toLowerCase() !== identifier.text) {
        //     this.snapshot.diagnostics.push({
        //         range: nameOriginalRange,
        //         message: `Variable '${vd.name}' is not using snake case. Consider renaming it to '${this.toSnakeCase(vd.name)}'.`,
        //         severity: DiagnosticSeverity.Warning,
        //     });
        // }
        this.scope.variableDeclarations.push(vd);
        this.visitChildren(ctx);
    }

    private toSnakeCase(name: string): string {
        return name.replace(/(?<=[a-z0-9])([A-Z]+)/g, '_$1').toLowerCase();
    }

    public visitDshl_expression?(ctx: Dshl_expressionContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        if (visible) {
            const identifier = ctx.IDENTIFIER();
            if (identifier) {
                const position = identifier.symbol.startIndex;
                const originalPosition = this.snapshot.getOriginalPosition(position, true);
                const vd = this.snapshot.getVariableDeclarationFor(identifier.text, originalPosition);
                if (vd) {
                    this.createVariableUsage(vd, identifier, visible);
                    this.visitChildren(ctx);
                    return;
                } else if (this.rootSnapshot && this.contentStartPosition) {
                    const vd = this.rootSnapshot.getVariableDeclarationFor(
                        identifier.text,
                        this.contentStartPosition,
                        true
                    );
                    if (vd) {
                        this.createVariableUsage(vd, identifier, visible);
                        this.visitChildren(ctx);
                        return;
                    }
                }
                const sd = this.snapshot.getShaderDeclarationFor(identifier.text, originalPosition);
                if (sd) {
                    const su: ShaderUsage = {
                        declaration: sd,
                        originalRange: this.snapshot.getOriginalRange(
                            identifier.symbol.startIndex,
                            identifier.symbol.stopIndex + 1
                        ),
                        isVisible: visible,
                    };
                    this.scope.shaderUsages.push(su);
                    sd.usages.push(su);
                    this.visitChildren(ctx);
                    return;
                } else if (this.rootSnapshot && this.contentStartPosition) {
                    const sd = this.snapshot.getShaderDeclarationFor(identifier.text, this.contentStartPosition, true);
                    if (sd) {
                        const su: ShaderUsage = {
                            declaration: sd,
                            originalRange: this.snapshot.getOriginalRange(
                                identifier.symbol.startIndex,
                                identifier.symbol.stopIndex + 1
                            ),
                            isVisible: visible,
                        };
                        this.scope.shaderUsages.push(su);
                        sd.usages.push(su);
                        this.visitChildren(ctx);
                        return;
                    }
                }
            }
        }
        this.visitChildren(ctx);
    }

    public visitDshl_function_call(ctx: Dshl_function_callContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        if (visible) {
            const name = ctx.IDENTIFIER();
            const fd = (this.rootSnapshot ?? this.snapshot).rootScope.functionDeclarations.find(
                (fd) => fd.name === name.text
            );
            if (fd) {
                const fu: FunctionUsage = {
                    declaration: fd,
                    arguments: this.getFunctionArguments(ctx, fd),
                    originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
                    nameOriginalRange: this.snapshot.getOriginalRange(
                        ctx.IDENTIFIER().symbol.startIndex,
                        ctx.IDENTIFIER().symbol.stopIndex + 1
                    ),
                    parameterListOriginalRange: this.snapshot.getOriginalRange(
                        ctx.LRB().symbol.startIndex + 1,
                        ctx.RRB().symbol.stopIndex
                    ),
                    isVisible: visible,
                };
                fd.usages.push(fu);
                this.scope.functionUsages.push(fu);
            }
        }
        this.visitChildren(ctx);
    }

    private getFunctionArguments(ctx: Dshl_function_callContext, fd: FunctionDeclaration): FunctionArgument[] {
        const expressions = ctx.expression_list()?.expression() ?? [];
        const fas: FunctionArgument[] = [];
        for (let i = 0; i < expressions.length && i < fd.parameters.length; i++) {
            const expression = expressions[i];
            const start =
                i === 0 ? ctx.LRB().symbol.startIndex : ctx.expression_list()!.COMMA()[i - 1].symbol.stopIndex;
            const end =
                i === fd.parameters.length - 1 || ctx.expression_list()!.COMMA().length === i
                    ? ctx.RRB().symbol.stopIndex
                    : ctx.expression_list()!.COMMA()[i].symbol.startIndex - 1;
            const fa: FunctionArgument = {
                originalRange: this.snapshot.getOriginalRange(start, end + 1),
                trimmedOriginalStartPosition: this.snapshot.getOriginalPosition(expression.start.startIndex, true),
            };
            fas.push(fa);
        }
        return fas;
    }

    public visitDshl_shader_declaration(ctx: Dshl_shader_declarationContext): void {
        const scope = this.createScope(ctx);
        this.scope.children.push(scope);
        this.scope = scope;
        for (const shader of ctx.IDENTIFIER()) {
            const shaderName = shader.text;
            const sd: ShaderDeclaration = {
                name: shaderName,
                originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
                nameOriginalRange: this.snapshot.getOriginalRange(
                    shader.symbol.startIndex,
                    shader.symbol.stopIndex + 1
                ),
                isVisible: this.isVisible(ctx.start.startIndex),
                uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
                usages: [],
            };
            this.scope.shaderDeclarations.push(sd);
        }
        this.visitChildren(ctx);
        this.scope = scope.parent!;
    }

    public visitDshl_interval_declaration(ctx: Dshl_interval_declarationContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        if (visible) {
            const identifier = ctx.IDENTIFIER(0);
            const position = identifier.symbol.startIndex;
            const originalPosition = this.snapshot.getOriginalPosition(position, true);
            const vd = this.snapshot.getVariableDeclarationFor(identifier.text, originalPosition);
            if (vd) {
                const id: IntervalDeclaration = {
                    originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
                    nameOriginalRange: this.snapshot.getOriginalRange(
                        identifier.symbol.startIndex,
                        identifier.symbol.stopIndex + 1
                    ),
                    uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
                    isVisible: visible,
                    variable: vd,
                };
                vd.interval = id;
            }
        }
        this.visitChildren(ctx);
    }

    public visitDshl_block_block(ctx: Dshl_block_blockContext): void {
        const scope = this.createScope(ctx);
        this.scope.children.push(scope);
        this.scope = scope;
        const type = ctx.IDENTIFIER(0);
        const identifier = ctx.IDENTIFIER(1);
        const bd: BlockDeclaration = {
            type: type.text,
            name: identifier.text,
            originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
            nameOriginalRange: this.snapshot.getOriginalRange(
                identifier.symbol.startIndex,
                identifier.symbol.stopIndex + 1
            ),
            uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
            isVisible: this.isVisible(ctx.start.startIndex),
            usages: [],
        };
        this.scope.blockDeclaration = bd;
        this.visitChildren(ctx);
        this.scope = scope.parent!;
    }

    public visitDshl_supports_statement(ctx: Dshl_supports_statementContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        if (visible) {
            const identifier = ctx.IDENTIFIER();
            const position = identifier.symbol.startIndex;
            const originalPosition = this.snapshot.getOriginalPosition(position, true);
            const bd = this.snapshot.getBlockDeclarationFor(identifier.text, originalPosition);
            if (bd) {
                const bu: BlockUsage = {
                    originalRange: this.snapshot.getOriginalRange(
                        identifier.symbol.startIndex,
                        identifier.symbol.stopIndex + 1
                    ),
                    isVisible: visible,
                    declaration: bd,
                };
                bd.usages.push(bu);
                this.scope.blockUsages.push(bu);
            } else if (this.rootSnapshot && this.contentStartPosition) {
                const bd = this.snapshot.getBlockDeclarationFor(identifier.text, this.contentStartPosition, true);
                if (bd) {
                    const bu: BlockUsage = {
                        originalRange: this.snapshot.getOriginalRange(
                            identifier.symbol.startIndex,
                            identifier.symbol.stopIndex + 1
                        ),
                        isVisible: visible,
                        declaration: bd,
                    };
                    bd.usages.push(bu);
                    this.scope.blockUsages.push(bu);
                }
            }
        }
        this.visitChildren(ctx);
    }

    public visitDshl_assignment(ctx: Dshl_assignmentContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        if (visible && ctx.dshl_hlsl_block() && ctx.ASSIGN()) {
            const identifier = ctx.IDENTIFIER(2);
            const position = identifier.symbol.startIndex;
            const originalPosition = this.snapshot.getOriginalPosition(position, true);
            const vd = this.snapshot.getVariableDeclarationFor(identifier.text, originalPosition);
            if (vd) {
                this.createVariableUsage(vd, identifier, visible);
            } else if (this.rootSnapshot && this.contentStartPosition) {
                const vd = this.rootSnapshot.getVariableDeclarationFor(
                    identifier.text,
                    this.contentStartPosition,
                    true
                );
                if (vd) {
                    this.createVariableUsage(vd, identifier, visible);
                }
            }
        }
        this.visitChildren(ctx);
    }

    public visitDshl_assume_statement(ctx: Dshl_assume_statementContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        if (visible) {
            const identifier = ctx.IDENTIFIER();
            const position = identifier.symbol.startIndex;
            const originalPosition = this.snapshot.getOriginalPosition(position, true);
            const vd = this.snapshot.getVariableDeclarationFor(identifier.text, originalPosition);
            if (vd) {
                this.createVariableUsage(vd, identifier, visible);
            } else if (this.rootSnapshot && this.contentStartPosition) {
                const vd = this.rootSnapshot.getVariableDeclarationFor(
                    identifier.text,
                    this.contentStartPosition,
                    true
                );
                if (vd) {
                    this.createVariableUsage(vd, identifier, visible);
                }
            }
        }
        this.visitChildren(ctx);
    }

    private createVariableUsage(vd: VariableDeclaration, identifier: TerminalNode, visible: boolean): VariableUsage {
        const vu: VariableUsage = {
            declaration: vd,
            originalRange: this.snapshot.getOriginalRange(
                identifier.symbol.startIndex,
                identifier.symbol.stopIndex + 1
            ),
            isVisible: visible,
        };
        this.scope.variableUsages.push(vu);
        vd.usages.push(vu);
        return vu;
    }

    private createScope(ctx: ParserRuleContext): Scope {
        return {
            shaderDeclarations: [],
            shaderUsages: [],
            variableDeclarations: [],
            variableUsages: [],
            functionDeclarations: [],
            functionUsages: [],
            blockUsages: [],
            originalRange: this.getRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
            children: [],
            parent: this.scope,
            isVisible: this.isVisible(ctx.start.startIndex),
        };
    }

    protected defaultResult(): void {}
}
