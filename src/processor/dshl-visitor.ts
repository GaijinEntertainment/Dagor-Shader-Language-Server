import { ParserRuleContext, Token } from 'antlr4ts';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { Position, Range } from 'vscode-languageserver';
import {
    DshlParser,
    Dshl_assignmentContext,
    Dshl_assume_statementContext,
    Dshl_block_blockContext,
    Dshl_expressionContext,
    Dshl_function_callContext,
    Dshl_hlsl_blockContext,
    Dshl_interval_declarationContext,
    Dshl_preshader_blockContext,
    Dshl_shader_declarationContext,
    Dshl_statement_blockContext,
    Dshl_supports_statementContext,
    Dshl_variable_declarationContext,
    Enum_declarationContext,
    ExpressionContext,
    ParameterContext,
    State_objectContext,
    Statement_blockContext,
    Type_declarationContext,
    Variable_declarationContext,
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
import { shaderStageKeywordToEnum } from '../interface/shader-stage';
import { ShaderDeclaration } from '../interface/shader/shader-declaration';
import { ShaderUsage } from '../interface/shader/shader-usage';
import { EnumDeclaration } from '../interface/type/enum-declaration';
import { TypeDeclaration } from '../interface/type/type-declaration';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';

export class DshlVisitor extends AbstractParseTreeVisitor<void> implements DshlParserVisitor<void> {
    private snapshot: Snapshot;
    private scope: Scope;
    private rootSnapshot?: Snapshot;
    private contentStartPosition?: Position;
    private shader: Scope | null = null;
    private globalHlslBlocks: Scope[] = [];
    private localHlslBlocks: Scope[] = [];
    private preshaders: Scope[] = [];
    private type: TypeDeclaration | null = null;

    public constructor(snapshot: Snapshot, rootSnapshot?: Snapshot, contentStartPosition?: Position) {
        super();
        this.snapshot = snapshot;
        this.scope = snapshot.rootScope;
        this.rootSnapshot = rootSnapshot;
        this.contentStartPosition = contentStartPosition;
    }

    private isVisible(position: number): boolean {
        return (
            !this.snapshot.isInIncludeContext(position) &&
            !this.snapshot.isInMacroContext(position) &&
            !this.snapshot.isInDefineContext(position)
        );
    }

    // region DSHL

    public visitDshl_statement_block(ctx: Dshl_statement_blockContext): void {
        if (this.isVisible(ctx.LCB().symbol.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        const scope = this.createScope(ctx);
        if (ctx.parent?.ruleIndex === DshlParser.RULE_dshl_preshader_block) {
            this.preshaders.push(scope);
            const preshaderCtx = ctx.parent as Dshl_preshader_blockContext;
            scope.preshaderStage = shaderStageKeywordToEnum(preshaderCtx.IDENTIFIER().text);
        }
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
        const scope = this.createScope(ctx);
        const identifier = ctx.IDENTIFIER();
        if (identifier) {
            scope.hlslStage = shaderStageKeywordToEnum(identifier.text);
        }
        scope.hlslBlocks.push(
            ...this.globalHlslBlocks.filter((b) => b.hlslStage === scope.hlslStage || b.hlslStage == null)
        );
        scope.hlslBlocks.push(
            ...this.localHlslBlocks.filter((b) => b.hlslStage === scope.hlslStage || b.hlslStage == null)
        );
        scope.preshaders.push(
            ...this.preshaders.filter((b) => b.preshaderStage === scope.hlslStage || b.preshaderStage == null)
        );
        this.scope.children.push(scope);
        this.scope = scope;
        this.visitChildren(ctx);
        if (this.shader) {
            this.localHlslBlocks.push(scope);
        } else {
            this.globalHlslBlocks.push(scope);
        }
        this.scope = scope.parent!;
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
            isHlsl: false,
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
                    this.createVariableUsage(vd, identifier.symbol, visible);
                    this.visitChildren(ctx);
                    return;
                } else if (this.rootSnapshot && this.contentStartPosition) {
                    const vd = this.rootSnapshot.getVariableDeclarationFor(
                        identifier.text,
                        this.contentStartPosition,
                        true
                    );
                    if (vd) {
                        this.createVariableUsage(vd, identifier.symbol, visible);
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
        this.shader = scope;
        this.visitChildren(ctx);
        this.localHlslBlocks = [];
        this.preshaders = [];
        this.shader = null;
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
        if (ctx.AT() && !ctx.dshl_hlsl_block()) {
            const identifier = ctx.IDENTIFIER(0);
            const type = ctx.IDENTIFIER(1);
            const nameOriginalRange = this.snapshot.getOriginalRange(
                identifier.symbol.startIndex,
                identifier.symbol.stopIndex + 1
            );
            const vd: VariableDeclaration = {
                type: this.dshlToHlslType(type.text),
                name: identifier.text,
                nameEndPosition: ctx.stop!.stopIndex + 1,
                originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
                nameOriginalRange,
                uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
                isVisible: visible,
                usages: [],
                isHlsl: true,
            };
            this.scope.variableDeclarations.push(vd);
        }
        if (visible && ctx.dshl_hlsl_block() && ctx.ASSIGN()) {
            const identifier = ctx.IDENTIFIER(2);
            const position = identifier.symbol.startIndex;
            const originalPosition = this.snapshot.getOriginalPosition(position, true);
            const vd = this.snapshot.getVariableDeclarationFor(identifier.text, originalPosition);
            if (vd) {
                this.createVariableUsage(vd, identifier.symbol, visible);
            } else if (this.rootSnapshot && this.contentStartPosition) {
                const vd = this.rootSnapshot.getVariableDeclarationFor(
                    identifier.text,
                    this.contentStartPosition,
                    true
                );
                if (vd) {
                    this.createVariableUsage(vd, identifier.symbol, visible);
                }
            }
        }
        this.visitChildren(ctx);
    }

    private dshlToHlslType(dshtlType: string): string {
        switch (dshtlType) {
            case 'f1':
                return 'float';
            case 'f2':
                return 'float2';
            case 'f3':
                return 'float3';
            case 'f4':
                return 'float4';
            case 'i1':
                return 'int';
            case 'i2':
                return 'int2';
            case 'i3':
                return 'int3';
            case 'i4':
                return 'int4';
            case 'f44':
                return 'float4x4';
            case 'buf':
                return 'Buffer/StructuredBuffer';
            case 'cbuf':
                return 'ConstantBuffer';
            case 'uav':
                return 'uav';
            default:
                return 'unknown type';
        }
    }

    public visitDshl_assume_statement(ctx: Dshl_assume_statementContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        if (visible) {
            const identifier = ctx.IDENTIFIER();
            const position = identifier.symbol.startIndex;
            const originalPosition = this.snapshot.getOriginalPosition(position, true);
            const vd = this.snapshot.getVariableDeclarationFor(identifier.text, originalPosition);
            if (vd) {
                this.createVariableUsage(vd, identifier.symbol, visible);
            } else if (this.rootSnapshot && this.contentStartPosition) {
                const vd = this.rootSnapshot.getVariableDeclarationFor(
                    identifier.text,
                    this.contentStartPosition,
                    true
                );
                if (vd) {
                    this.createVariableUsage(vd, identifier.symbol, visible);
                }
            }
        }
        this.visitChildren(ctx);
    }

    // region HLSL

    public visitStatement_block(ctx: Statement_blockContext): void {
        if (this.isVisible(ctx.start.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        const scope = this.createScope(ctx);
        this.scope.children.push(scope);
        this.scope = scope;
        this.visitChildren(ctx);
        this.scope = scope.parent!;
    }

    public visitType_declaration(ctx: Type_declarationContext): void {
        const visible = this.isVisible(ctx.LCB().symbol.startIndex);
        if (visible) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        const identifier = ctx.hlsl_identifier();
        const originalRange = this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1);
        const nameOriginalRange = identifier
            ? this.snapshot.getOriginalRange(identifier.start.startIndex, identifier.stop!.stopIndex + 1)
            : originalRange;
        const td: TypeDeclaration = {
            name: identifier ? identifier.text : '',
            uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
            originalRange,
            nameOriginalRange,
            isVisible: visible,
            usages: [],
            members: [],
        };
        this.scope.typeDeclarations.push(td);
        this.type = td;
        this.visitChildren(ctx);
        this.type = null;
    }

    public visitEnum_declaration(ctx: Enum_declarationContext): void {
        const visible = this.isVisible(ctx.LCB().symbol.startIndex);
        if (visible) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        const identifier = ctx.hlsl_identifier().length ? ctx.hlsl_identifier(0) : null;
        const type = ctx.hlsl_identifier().length > 1 ? ctx.hlsl_identifier(1) : null;
        const originalRange = this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1);
        const nameOriginalRange = identifier
            ? this.snapshot.getOriginalRange(identifier.start.startIndex, identifier.stop!.stopIndex + 1)
            : undefined;
        const ed: EnumDeclaration = {
            name: identifier ? identifier.text : undefined,
            type: type ? type.text : undefined,
            isClass: !!ctx.CLASS(),
            uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
            originalRange,
            nameOriginalRange,
            isVisible: visible,
            members: ctx.enum_member().map((em) => ({
                name: em.hlsl_identifier().text,
                nameOriginalRange: this.snapshot.getOriginalRange(
                    em.hlsl_identifier().start.startIndex,
                    em.hlsl_identifier().stop!.stopIndex + 1
                ),
                originalRange: this.snapshot.getOriginalRange(em.start.startIndex, em.stop!.stopIndex + 1),
            })),
        };
        this.scope.enumDeclarations.push(ed);
        this.visitChildren(ctx);
    }

    public visitState_object(ctx: State_objectContext): void {
        if (this.isVisible(ctx.LCB().symbol.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        this.visitChildren(ctx);
    }

    public visitVariable_declaration(ctx: Variable_declarationContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        for (const vi of ctx.variable_initialization()) {
            const type = ctx.type();
            const identifier = vi.hlsl_identifier();
            const nameOriginalRange = this.snapshot.getOriginalRange(
                identifier.start.startIndex,
                identifier.stop!.stopIndex + 1
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
                isHlsl: true,
            };
            if (this.type) {
                this.type.members.push(vd);
            } else {
                this.scope.variableDeclarations.push(vd);
            }
        }
        this.visitChildren(ctx);
    }

    public visitParameter(ctx: ParameterContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        const type = ctx.type();
        if (visible && type) {
            const visible = this.isVisible(ctx.start.startIndex);
            const identifier = ctx.hlsl_identifier(0);
            const nameOriginalRange = this.snapshot.getOriginalRange(
                identifier.start.startIndex,
                identifier.stop!.stopIndex + 1
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
                isHlsl: true,
            };
            this.scope.variableDeclarations.push(vd);
        }
        this.visitChildren(ctx);
    }

    public visitExpression(ctx: ExpressionContext): void {
        const visible = this.isVisible(ctx.start.startIndex);
        if (visible) {
            for (const identifier of ctx.hlsl_identifier()) {
                const position = identifier.start.startIndex;
                const originalPosition = this.snapshot.getOriginalPosition(position, true);
                const vd = this.snapshot.getVariableDeclarationFor(identifier.text, originalPosition);
                if (vd) {
                    this.createVariableUsage(vd, identifier.start, visible);
                } else if (this.rootSnapshot && this.contentStartPosition) {
                    const vd = this.rootSnapshot.getVariableDeclarationFor(
                        identifier.text,
                        this.contentStartPosition,
                        true
                    );
                    if (vd) {
                        this.createVariableUsage(vd, identifier.start, visible);
                    }
                }
            }
        }
        this.visitChildren(ctx);
    }

    // region shared

    private createVariableUsage(vd: VariableDeclaration, identifier: Token, visible: boolean): VariableUsage {
        const vu: VariableUsage = {
            declaration: vd,
            originalRange: this.snapshot.getOriginalRange(identifier.startIndex, identifier.stopIndex + 1),
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
            typeDeclarations: [],
            typeUsages: [],
            enumDeclarations: [],
            variableDeclarations: [],
            variableUsages: [],
            functionDeclarations: [],
            functionUsages: [],
            blockUsages: [],
            originalRange: this.getRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
            children: [],
            parent: this.scope,
            isVisible: this.isVisible(ctx.start.startIndex),
            hlslBlocks: [],
            preshaders: [],
        };
    }

    protected defaultResult(): void {}
}
