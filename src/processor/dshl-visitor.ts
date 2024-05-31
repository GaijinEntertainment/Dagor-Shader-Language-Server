import { ParserRuleContext, Token } from 'antlr4ts';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { Position, Range } from 'vscode-languageserver';
import {
    Array_subscriptContext,
    Do_statementContext,
    DshlParser,
    Dshl_array_subscriptContext,
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
    For_statementContext,
    Function_callContext,
    Function_definitionContext,
    If_statementContext,
    ParameterContext,
    State_objectContext,
    Statement_blockContext,
    Switch_statementContext,
    TypeContext,
    Type_declarationContext,
    Variable_declarationContext,
    While_statementContext,
} from '../_generated/DshlParser';
import { DshlParserVisitor } from '../_generated/DshlParserVisitor';
import { Snapshot } from '../core/snapshot';
import { Scope } from '../helper/scope';
import { BlockDeclaration } from '../interface/block/block-declaration';
import { BlockUsage } from '../interface/block/block-usage';
import { ExpressionResult } from '../interface/expression-result';
import { FunctionArgument } from '../interface/function/function-argument';
import { FunctionDeclaration } from '../interface/function/function-declaration';
import { FunctionUsage } from '../interface/function/function-usage';
import { IntrinsicFunction } from '../interface/function/intrinsic-function';
import { IntervalDeclaration } from '../interface/interval-declaration';
import { shaderStageKeywordToEnum } from '../interface/shader-stage';
import { ShaderDeclaration } from '../interface/shader/shader-declaration';
import { ShaderUsage } from '../interface/shader/shader-usage';
import { EnumDeclaration } from '../interface/type/enum-declaration';
import { EnumMemberDeclaration } from '../interface/type/enum-member-declaration';
import { EnumUsage } from '../interface/type/enum-usage';
import { TypeDeclaration, TypeKeyword } from '../interface/type/type-declaration';
import { TypeUsage } from '../interface/type/type-usage';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';
import { ExpressionVisitor } from './expression-visitor';

export class DshlVisitor
    extends AbstractParseTreeVisitor<ExpressionResult | null>
    implements DshlParserVisitor<ExpressionResult | null>
{
    private snapshot: Snapshot;
    private scope: Scope;
    private rootSnapshot?: Snapshot;
    private contentStartPosition?: Position;
    private shader: Scope | null = null;
    private globalHlslBlocks: Scope[] = [];
    private localHlslBlocks: Scope[] = [];
    private preshaders: Scope[] = [];
    private type: TypeDeclaration[] = [];
    private enum: EnumDeclaration | null = null;

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

    public visitDshl_statement_block(ctx: Dshl_statement_blockContext): ExpressionResult | null {
        const visible = this.isVisible(ctx.LCB().symbol.startIndex);
        if (visible) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        const range = this.getRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1);
        const scope = this.createScope(visible, range);
        if (ctx.parent?.ruleIndex === DshlParser.RULE_dshl_preshader_block) {
            this.preshaders.push(scope);
            const preshaderCtx = ctx.parent as Dshl_preshader_blockContext;
            scope.preshaderStage = shaderStageKeywordToEnum(preshaderCtx.IDENTIFIER().text);
        }
        this.scope.children.push(scope);
        this.scope = scope;
        this.visitChildren(ctx);
        this.scope = scope.parent!;
        return null;
    }

    public visitDshl_hlsl_block(ctx: Dshl_hlsl_blockContext): ExpressionResult | null {
        const visible = this.isVisible(ctx.LCB().symbol.startIndex);
        if (visible) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        const range = this.getRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1);
        const scope = this.createScope(visible, range);
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
        return null;
    }

    public visitDshl_variable_declaration(ctx: Dshl_variable_declarationContext): ExpressionResult | null {
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
            arraySizes: this.getDshlArraySize(ctx.dshl_array_subscript()),
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
        return null;
    }

    private toSnakeCase(name: string): string {
        return name.replace(/(?<=[a-z0-9])([A-Z]+)/g, '_$1').toLowerCase();
    }

    public visitDshl_expression?(ctx: Dshl_expressionContext): ExpressionResult | null {
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
                    return null;
                } else if (this.rootSnapshot && this.contentStartPosition) {
                    const vd = this.rootSnapshot.getVariableDeclarationFor(
                        identifier.text,
                        this.contentStartPosition,
                        true
                    );
                    if (vd) {
                        this.createVariableUsage(vd, identifier.symbol, visible);
                        this.visitChildren(ctx);
                        return null;
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
                    return null;
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
                        return null;
                    }
                }
            }
        }
        this.visitChildren(ctx);
        return null;
    }

    public visitDshl_function_call(ctx: Dshl_function_callContext): ExpressionResult | null {
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
        return null;
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

    public visitDshl_shader_declaration(ctx: Dshl_shader_declarationContext): ExpressionResult | null {
        const visible = this.isVisible(ctx.start.startIndex);
        const range = this.getRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1);
        const scope = this.createScope(visible, range);
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
                isVisible: visible,
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
        return null;
    }

    public visitDshl_interval_declaration(ctx: Dshl_interval_declarationContext): ExpressionResult | null {
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
        return null;
    }

    public visitDshl_block_block(ctx: Dshl_block_blockContext): ExpressionResult | null {
        const visible = this.isVisible(ctx.start.startIndex);
        const range = this.getRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1);
        const scope = this.createScope(visible, range);
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
            isVisible: visible,
            usages: [],
        };
        this.scope.blockDeclaration = bd;
        this.visitChildren(ctx);
        this.scope = scope.parent!;
        return null;
    }

    public visitDshl_supports_statement(ctx: Dshl_supports_statementContext): ExpressionResult | null {
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
        return null;
    }

    public visitDshl_assignment(ctx: Dshl_assignmentContext): ExpressionResult | null {
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
                arraySizes: this.getDshlArraySize(ctx.dshl_array_subscript()),
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
        return null;
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

    public visitDshl_assume_statement(ctx: Dshl_assume_statementContext): ExpressionResult | null {
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
        return null;
    }

    // region HLSL

    public visitStatement_block(ctx: Statement_blockContext): ExpressionResult | null {
        const visible = this.isVisible(ctx.start.startIndex);
        if (visible) {
            const range = this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        const range = this.getRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1);
        const scope = this.createScope(visible, range);
        this.scope.children.push(scope);
        this.scope = scope;
        this.visitChildren(ctx);
        this.scope = scope.parent!;
        return null;
    }

    public visitType_declaration(ctx: Type_declarationContext): ExpressionResult | null {
        const visible = this.isVisible(ctx.LCB().symbol.startIndex);
        if (visible) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        const identifier = ctx.hlsl_identifier().length ? ctx.hlsl_identifier(0) : null;
        const originalRange = this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1);
        const nameOriginalRange = identifier
            ? this.snapshot.getOriginalRange(identifier.start.startIndex, identifier.stop!.stopIndex + 1)
            : originalRange;
        const td: TypeDeclaration = {
            type: this.getTypeKeyword(ctx.type_keyowrd().text),
            name: identifier?.text,
            uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
            originalRange,
            nameOriginalRange,
            isVisible: visible,
            isBuiltIn: false,
            usages: [],
            members: [],
            superTypes: [],
            subTypes: [],
            embeddedTypes: [],
            embeddedEnums: [],
        };
        if (this.type.length) {
            this.type[this.type.length - 1].embeddedTypes.push(td);
        } else {
            this.scope.typeDeclarations.push(td);
        }
        for (let i = 1; i < ctx.hlsl_identifier().length; i++) {
            const superTd = this.snapshot.getTypeDeclarationFor(ctx.hlsl_identifier(i).text, nameOriginalRange.start);
            if (superTd) {
                const superTu: TypeUsage = {
                    declaration: superTd,
                    originalRange: this.snapshot.getOriginalRange(
                        ctx.hlsl_identifier(i).start.startIndex,
                        ctx.hlsl_identifier(i).stop!.stopIndex + 1
                    ),
                    isVisible: visible,
                };
                this.scope.typeUsages.push(superTu);
                superTd.usages.push(superTu);
                td.superTypes.push(superTd);
                superTd.subTypes.push(td);
            }
        }
        this.type.push(td);
        this.visitChildren(ctx);
        this.type.pop();
        return { type: 'type', typeDeclaration: td, arraySizes: [] };
    }

    private getTypeKeyword(type: string): TypeKeyword {
        if (type === 'struct' || type === 'class' || type === 'interface') {
            return type;
        } else {
            return 'struct';
        }
    }

    public visitEnum_declaration(ctx: Enum_declarationContext): ExpressionResult | null {
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
            members: [],
            usages: [],
            isBuiltIn: false,
        };
        for (const memberContext of ctx.enum_member()) {
            const value = memberContext.expression()?.literal()?.INT_LITERAL()?.text;
            const emd: EnumMemberDeclaration = {
                enumDeclaration: ed,
                name: memberContext.hlsl_identifier().text,
                nameOriginalRange: this.snapshot.getOriginalRange(
                    memberContext.hlsl_identifier().start.startIndex,
                    memberContext.hlsl_identifier().stop!.stopIndex + 1
                ),
                originalRange: this.snapshot.getOriginalRange(
                    memberContext.start.startIndex,
                    memberContext.stop!.stopIndex + 1
                ),
                usages: [],
                isVisible: visible,
                uri: this.snapshot.getIncludeContextDeepAt(memberContext.start.startIndex)?.uri ?? this.snapshot.uri,
                value,
            };
            ed.members.push(emd);
            this.scope.enumMemberDeclarations.push(emd);
        }
        if (this.type.length) {
            this.type[this.type.length - 1].embeddedEnums.push(ed);
        } else {
            this.scope.enumDeclarations.push(ed);
        }
        this.enum = ed;
        this.visitChildren(ctx);
        this.enum = null;
        return { type: 'enum', enumDeclaration: ed, arraySizes: [] };
    }

    public visitState_object(ctx: State_objectContext): ExpressionResult | null {
        if (this.isVisible(ctx.LCB().symbol.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        this.visitChildren(ctx);
        return null;
    }

    public visitVariable_declaration(ctx: Variable_declarationContext): ExpressionResult | null {
        const visible = this.isVisible(ctx.start.startIndex);
        const type = ctx.type();
        const tdCtx = ctx.type_declaration();
        const expResult = type ? this.getType(type, visible) : this.visit(tdCtx!);
        for (const vi of ctx.variable_initialization()) {
            const identifier = vi.hlsl_identifier();
            const nameOriginalRange = this.snapshot.getOriginalRange(
                identifier.start.startIndex,
                identifier.stop!.stopIndex + 1
            );
            const vd: VariableDeclaration = {
                type: type?.text ?? this.getTypeName(expResult) ?? '',
                typeDeclaration: expResult?.type === 'type' ? expResult.typeDeclaration : undefined,
                enumDeclaration: expResult?.type === 'enum' ? expResult.enumDeclaration : undefined,
                name: identifier.text,
                nameEndPosition: ctx.stop!.stopIndex + 1,
                originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
                nameOriginalRange,
                uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
                isVisible: visible,
                usages: [],
                isHlsl: true,
                arraySizes: this.getArraySize(vi.array_subscript()),
                containerType: this.type.length ? this.type[this.type.length - 1] : undefined,
            };
            if (this.type.length) {
                this.type[this.type.length - 1].members.push(vd);
            } else {
                this.scope.variableDeclarations.push(vd);
            }
        }

        this.visitChildren(ctx);
        return null;
    }

    private getTypeName(er: ExpressionResult | null): string | null {
        if (!er) {
            return null;
        }
        if (er.type === 'type') {
            return er.typeDeclaration.name ?? null;
        } else if (er.type === 'enum') {
            return er.enumDeclaration.name ?? null;
        } else {
            return er.name;
        }
    }

    private getArraySize(ctx: Array_subscriptContext[]): number[] {
        return ctx.map((actx) => Number.parseInt(actx.expression()?.text ?? ''));
    }

    private getDshlArraySize(ctx: Dshl_array_subscriptContext[]): number[] {
        return ctx.map((actx) => Number.parseInt(actx.dshl_expression()?.text ?? ''));
    }

    private getType(ctx: TypeContext, visible: boolean): ExpressionResult | null {
        let td: TypeDeclaration | null = null;
        let ed: EnumDeclaration | null = null;
        for (const id of ctx.hlsl_identifier()) {
            const nameOriginalRange = this.snapshot.getOriginalRange(id.start.startIndex, id.stop!.stopIndex + 1);
            if (!td && !ed) {
                td = this.snapshot.getTypeDeclarationFor(id.text, nameOriginalRange.start);
                if (td) {
                    const tu: TypeUsage = {
                        declaration: td,
                        originalRange: this.snapshot.getOriginalRange(id.start.startIndex, id.stop!.stopIndex + 1),
                        isVisible: visible,
                    };
                    td.usages.push(tu);
                    this.scope.typeUsages.push(tu);
                    continue;
                }
                ed = this.snapshot.getEnumDeclarationFor(id.text, nameOriginalRange.start);
                if (ed) {
                    const eu: EnumUsage = {
                        declaration: ed,
                        originalRange: this.snapshot.getOriginalRange(id.start.startIndex, id.stop!.stopIndex + 1),
                        isVisible: visible,
                    };
                    ed.usages.push(eu);
                    this.scope.enumUsages.push(eu);
                    continue;
                }
                if (this.rootSnapshot && this.contentStartPosition) {
                    td = this.rootSnapshot.getTypeDeclarationFor(id.text, this.contentStartPosition, true);
                    if (td) {
                        const tu: TypeUsage = {
                            declaration: td,
                            originalRange: this.snapshot.getOriginalRange(id.start.startIndex, id.stop!.stopIndex + 1),
                            isVisible: visible,
                        };
                        td.usages.push(tu);
                        this.scope.typeUsages.push(tu);
                        continue;
                    }
                    ed = this.rootSnapshot.getEnumDeclarationFor(id.text, this.contentStartPosition, true);
                    if (ed) {
                        const eu: EnumUsage = {
                            declaration: ed,
                            originalRange: this.snapshot.getOriginalRange(id.start.startIndex, id.stop!.stopIndex + 1),
                            isVisible: visible,
                        };
                        ed.usages.push(eu);
                        this.scope.enumUsages.push(eu);
                        continue;
                    }
                }
            } else if (td) {
                ed = td.embeddedEnums.find((eed) => eed.name === id.text) ?? null;
                if (ed) {
                    const eu: EnumUsage = {
                        declaration: ed,
                        originalRange: this.snapshot.getOriginalRange(id.start.startIndex, id.stop!.stopIndex + 1),
                        isVisible: visible,
                    };
                    ed.usages.push(eu);
                    this.scope.enumUsages.push(eu);
                }
                td = td.embeddedTypes.find((etd) => etd.name === id.text) ?? null;
                if (td) {
                    const tu: TypeUsage = {
                        declaration: td,
                        originalRange: this.snapshot.getOriginalRange(id.start.startIndex, id.stop!.stopIndex + 1),
                        isVisible: visible,
                    };
                    td.usages.push(tu);
                    this.scope.typeUsages.push(tu);
                }
            } else if (ed) {
                return null;
            }
        }
        const arraySizes = this.getArraySize(ctx.array_subscript());
        if (td) {
            return { type: 'type', typeDeclaration: td, arraySizes };
        } else if (ed) {
            return { type: 'enum', enumDeclaration: ed, arraySizes };
        } else {
            return null;
        }
    }

    public visitParameter(ctx: ParameterContext): ExpressionResult | null {
        const visible = this.isVisible(ctx.start.startIndex);
        const type = ctx.type();
        if (visible && type) {
            const visible = this.isVisible(ctx.start.startIndex);
            const identifier = ctx.hlsl_identifier(0);
            const nameOriginalRange = this.snapshot.getOriginalRange(
                identifier.start.startIndex,
                identifier.stop!.stopIndex + 1
            );
            const td = this.snapshot.getTypeDeclarationFor(type.text, nameOriginalRange.start);
            if (td) {
                const tu: TypeUsage = {
                    declaration: td,
                    originalRange: this.snapshot.getOriginalRange(type.start.startIndex, type.stop!.stopIndex + 1),
                    isVisible: visible,
                };
                td.usages.push(tu);
                this.scope.typeUsages.push(tu);
            }
            const ed = this.snapshot.getEnumDeclarationFor(type.text, nameOriginalRange.start);
            if (ed) {
                const eu: EnumUsage = {
                    declaration: ed,
                    originalRange: this.snapshot.getOriginalRange(type.start.startIndex, type.stop!.stopIndex + 1),
                    isVisible: visible,
                };
                ed.usages.push(eu);
                this.scope.enumUsages.push(eu);
            }
            const vd: VariableDeclaration = {
                type: type.text,
                typeDeclaration: td ?? undefined,
                enumDeclaration: ed ?? undefined,
                name: identifier.text,
                nameEndPosition: ctx.stop!.stopIndex + 1,
                originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
                nameOriginalRange,
                uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
                isVisible: visible,
                usages: [],
                isHlsl: true,
                arraySizes: this.getArraySize(ctx.array_subscript()),
            };
            this.scope.variableDeclarations.push(vd);
        }
        this.visitChildren(ctx);
        return null;
    }

    public visitExpression(ctx: ExpressionContext): ExpressionResult | null {
        const result = new ExpressionVisitor(
            this.snapshot,
            this.scope,
            this.rootSnapshot,
            this.contentStartPosition,
            this.enum ?? undefined
        ).visitExpression(ctx);
        this.visitChildren(ctx);
        return result;
    }

    public visitFunction_definition(ctx: Function_definitionContext): ExpressionResult | null {
        const header = ctx.function_header();
        const LRB = header.LRB();
        const visible = this.isVisible(LRB.symbol.startIndex);
        const range = this.getRange(LRB.symbol.startIndex, ctx.stop!.stopIndex + 1);
        const scope = this.createScope(visible, range);
        this.getType(header.type(), visible);
        this.scope.children.push(scope);
        this.scope = scope;
        if (visible) {
            const fd: FunctionDeclaration = {
                name: header.hlsl_identifier().text,
                type: header.type().text,
                nameOriginalRange: this.getRange(
                    header.hlsl_identifier().start.startIndex,
                    header.hlsl_identifier().stop!.stopIndex + 1
                ),
                originalRange: this.getRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
                parameters:
                    header
                        .parameter_list()
                        ?.parameter()
                        .map((p) => ({
                            type: p.type()?.text ?? '',
                            name: p.hlsl_identifier(0).text,
                        })) ?? [],
                isVisible: visible,
                uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
                usages: [],
            };
            this.scope.functionDeclaration = fd;
        }
        this.visitChildren(ctx);
        this.scope = scope.parent!;
        return null;
    }

    public visitFunction_call(ctx: Function_callContext): ExpressionResult | null {
        const visible = this.isVisible(ctx.start.startIndex);
        const name = ctx.hlsl_identifier();
        let result: ExpressionResult | null = null;
        const functionArguments: (ExpressionResult | null)[] = [];
        if (visible && name) {
            const el = ctx.function_arguments().expression_list();
            if (el) {
                for (const exp of el.expression()) {
                    functionArguments.push(this.visit(exp));
                }
            }
            const position = this.snapshot.getOriginalPosition(name.start.startIndex, true);
            const fd = this.snapshot.getFunctionDeclarationFor(name.text, position);
            if (fd) {
                const fu: FunctionUsage = {
                    declaration: fd,
                    arguments: [],
                    originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
                    nameOriginalRange: this.snapshot.getOriginalRange(name.start.startIndex, name.stop!.stopIndex + 1),
                    parameterListOriginalRange: this.snapshot.getOriginalRange(
                        ctx.LRB().symbol.startIndex + 1,
                        ctx.RRB().symbol.stopIndex
                    ),
                    isVisible: visible,
                };
                fd.usages.push(fu);
                this.scope.functionUsages.push(fu);
                result = { type: 'name', name: fd.type, arraySizes: [] };
            } else {
                const ifd = this.getIntrinsicFunction(name.text, functionArguments);
                if (ifd) {
                    const fu: FunctionUsage = {
                        intrinsicFunction: ifd,
                        arguments: this.getHlslFunctionArguments(ctx, ifd),
                        originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
                        nameOriginalRange: this.snapshot.getOriginalRange(
                            name.start.startIndex,
                            name.stop!.stopIndex + 1
                        ),
                        parameterListOriginalRange: this.snapshot.getOriginalRange(
                            ctx.LRB().symbol.startIndex + 1,
                            ctx.RRB().symbol.stopIndex
                        ),
                        isVisible: visible,
                    };
                    ifd.usages.push(fu);
                    this.scope.functionUsages.push(fu);
                    result = { type: 'name', name: ifd.type, arraySizes: [] };
                }
            }
        }
        return result;
    }

    private getHlslFunctionArguments(ctx: Function_callContext, ifd: IntrinsicFunction): FunctionArgument[] {
        const el = ctx.function_arguments().expression_list();
        if (!el) {
            return [];
        }
        const expressions = el.expression() ?? [];
        const fas: FunctionArgument[] = [];
        for (let i = 0; i < expressions.length && i < ifd.parameters.length; i++) {
            const expression = expressions[i];
            const start = i === 0 ? ctx.LRB().symbol.startIndex : el.COMMA()[i - 1].symbol.stopIndex;
            const end =
                i === ifd.parameters.length - 1 || el.COMMA().length === i
                    ? ctx.RRB().symbol.stopIndex
                    : el.COMMA()[i].symbol.startIndex - 1;
            const fa: FunctionArgument = {
                originalRange: this.snapshot.getOriginalRange(start, end + 1),
                trimmedOriginalStartPosition: this.snapshot.getOriginalPosition(expression.start.startIndex, true),
            };
            fas.push(fa);
        }
        return fas;
    }

    private getIntrinsicFunction(
        name: string,
        functionArguments: (ExpressionResult | null)[]
    ): IntrinsicFunction | null {
        const snapshot = this.rootSnapshot ?? this.snapshot;
        const candidates = snapshot.intrinsicFunctions.filter((ifd) => ifd.name === name);
        for (const candidate of candidates) {
            if (candidate.parameters.length === functionArguments.length) {
                let valid = true;
                for (let i = 0; i < functionArguments.length; i++) {
                    const arg = functionArguments[i];
                    const parm = candidate.parameters[i];
                    if (
                        !arg ||
                        (arg.type === 'type' && arg.typeDeclaration.name !== parm.type) ||
                        (arg.type === 'name' && arg.name !== parm.type)
                    ) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    return candidate;
                }
            }
        }
        return candidates.length ? candidates[0] : null;
    }

    public visitFor_statement(ctx: For_statementContext): ExpressionResult | null {
        return this.createScopeAndVisit(ctx, ctx.LRB().symbol);
    }

    public visitWhile_statement(ctx: While_statementContext): ExpressionResult | null {
        return this.createScopeAndVisit(ctx, ctx.LRB().symbol);
    }

    public visitDo_statement(ctx: Do_statementContext): ExpressionResult | null {
        return this.createScopeAndVisit(ctx, ctx.LRB().symbol);
    }

    public visitIf_statement(ctx: If_statementContext): ExpressionResult | null {
        const LRB = ctx.LRB();
        let visible = this.isVisible(LRB.symbol.startIndex);
        let range = this.getRange(LRB.symbol.startIndex, ctx.statement(0).stop!.stopIndex + 1);
        let scope = this.createScope(visible, range);
        this.scope.children.push(scope);
        this.scope = scope;
        this.visit(ctx.expression());
        this.visit(ctx.statement(0));
        this.scope = scope.parent!;
        const elseCtx = ctx.ELSE();
        if (elseCtx) {
            const elseStatement = ctx.statement(1);
            visible = this.isVisible(elseCtx.symbol.startIndex);
            range = this.getRange(elseStatement.start.startIndex, elseStatement.stop!.stopIndex + 1);
            scope = this.createScope(visible, range);
            this.scope.children.push(scope);
            this.scope = scope;
            this.visit(ctx.statement(1));
            this.scope = scope.parent!;
        }
        return null;
    }

    public visitSwitch_statement(ctx: Switch_statementContext): ExpressionResult | null {
        return this.createScopeAndVisit(ctx, ctx.LRB().symbol);
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

    private createScopeAndVisit(ctx: ParserRuleContext, start = ctx.start, stop = ctx.stop!): null {
        const visible = this.isVisible(start.startIndex);
        const range = this.getRange(start.startIndex, stop.stopIndex + 1);
        const scope = this.createScope(visible, range);
        this.scope.children.push(scope);
        this.scope = scope;
        this.visitChildren(ctx);
        this.scope = scope.parent!;
        return null;
    }

    private createScope(visible: boolean, range: Range): Scope {
        return {
            shaderDeclarations: [],
            shaderUsages: [],
            typeDeclarations: [],
            typeUsages: [],
            enumDeclarations: [],
            enumUsages: [],
            enumMemberDeclarations: [],
            enumMemberUsages: [],
            variableDeclarations: [],
            variableUsages: [],
            functionDeclarations: [],
            functionUsages: [],
            blockUsages: [],
            originalRange: range,
            children: [],
            parent: this.scope,
            isVisible: visible,
            hlslBlocks: [],
            preshaders: [],
        };
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

    protected defaultResult(): ExpressionResult | null {
        return null;
    }
}
