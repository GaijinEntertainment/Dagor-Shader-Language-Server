import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import {
    Dshl_expressionContext,
    Dshl_function_callContext,
    Dshl_hlsl_blockContext,
    Dshl_statement_blockContext,
    Dshl_variable_declarationContext,
    State_objectContext,
    Statement_blockContext,
    Type_declarationContext,
} from '../_generated/DshlParser';
import { DshlParserVisitor } from '../_generated/DshlParserVisitor';
import { Snapshot } from '../core/snapshot';
import { Scope } from '../helper/scope';
import { FunctionArgument } from '../interface/function/function-argument';
import { FunctionDeclaration } from '../interface/function/function-declaration';
import { FunctionUsage } from '../interface/function/function-usage';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';

export class DshlVisitor extends AbstractParseTreeVisitor<void> implements DshlParserVisitor<void> {
    private snapshot: Snapshot;
    private scope: Scope;

    public constructor(snapshot: Snapshot) {
        super();
        this.snapshot = snapshot;
        this.scope = snapshot.rootScope;
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
        const scope: Scope = {
            variableDeclarations: [],
            variableUsages: [],
            functionDeclarations: [],
            functionUsages: [],
            originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex),
            children: [],
            parent: this.scope,
        };
        this.scope.children.push(scope);
        this.scope = scope;
        this.visitChildren(ctx);
        this.scope = scope.parent!;
    }

    public visitDshl_hlsl_block(ctx: Dshl_hlsl_blockContext): void {
        if (this.isVisible(ctx.LCB().symbol.startIndex)) {
            const range = this.snapshot.getOriginalRange(ctx.LCB().symbol.startIndex, ctx.RCB().symbol.stopIndex);
            this.snapshot.foldingRanges.push(range);
        }
        this.visitChildren(ctx);
    }

    public visitDshl_variable_declaration(ctx: Dshl_variable_declarationContext): void {
        const type = ctx.IDENTIFIER(0);
        const idenetifier = ctx.IDENTIFIER(1);
        const vd: VariableDeclaration = {
            type: type.text,
            name: idenetifier.text,
            nameEndPosition: ctx.stop!.stopIndex + 1,
            originalRange: this.snapshot.getOriginalRange(ctx.start.startIndex, ctx.stop!.stopIndex + 1),
            nameOriginalRange: this.snapshot.getOriginalRange(
                idenetifier.symbol.startIndex,
                idenetifier.symbol.stopIndex + 1
            ),
            uri: this.snapshot.getIncludeContextDeepAt(ctx.start.startIndex)?.uri ?? this.snapshot.uri,
            isVisible:
                !this.snapshot.isInIncludeContext(ctx.start.startIndex) &&
                !this.snapshot.isInMacroContext(ctx.start.startIndex),
            usages: [],
        };
        this.scope.variableDeclarations.push(vd);
        this.visitChildren(ctx);
    }

    public visitDshl_expression?(ctx: Dshl_expressionContext): void {
        const idenetifier = ctx.IDENTIFIER();
        if (idenetifier) {
            const position = idenetifier.symbol.startIndex;
            const vd = this.snapshot.getVariableDeclarationFor(
                idenetifier.text,
                this.snapshot.getOriginalPosition(position, true)
            );
            if (vd) {
                const vu: VariableUsage = {
                    declaration: vd,
                    originalRange: this.snapshot.getOriginalRange(
                        idenetifier.symbol.startIndex,
                        idenetifier.symbol.stopIndex + 1
                    ),
                    isVisible:
                        !this.snapshot.isInIncludeContext(ctx.start.startIndex) &&
                        !this.snapshot.isInMacroContext(ctx.start.startIndex),
                };
                this.scope.variableUsages.push(vu);
                vd.usages.push(vu);
            }
        }
        this.visitChildren(ctx);
    }

    public visitDshl_function_call(ctx: Dshl_function_callContext): void {
        const name = ctx.IDENTIFIER();
        const fd = this.snapshot.rootScope.functionDeclarations.find((fd) => fd.name === name.text);
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
                isVisible:
                    !this.snapshot.isInIncludeContext(ctx.start.startIndex) &&
                    !this.snapshot.isInMacroContext(ctx.start.startIndex),
            };
            fd.usages.push(fu);
            this.scope.functionUsages.push(fu);
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

    protected defaultResult(): void {}
}
