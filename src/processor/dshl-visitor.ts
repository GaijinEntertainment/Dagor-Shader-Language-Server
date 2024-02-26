import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import {
    Dshl_expressionContext,
    Dshl_hlsl_blockContext,
    Dshl_statement_blockContext,
    Dshl_variable_declarationContext,
    State_objectContext,
    Statement_blockContext,
    Type_declarationContext,
} from '../_generated/DshlParser';
import { DshlParserVisitor } from '../_generated/DshlParserVisitor';
import { Snapshot } from '../core/snapshot';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';

export class DshlVisitor extends AbstractParseTreeVisitor<void> implements DshlParserVisitor<void> {
    private snapshot: Snapshot;

    public constructor(snapshot: Snapshot) {
        super();
        this.snapshot = snapshot;
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
        this.visitChildren(ctx);
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
        this.snapshot.variableDeclarations.push(vd);
        this.visitChildren(ctx);
    }

    public visitDshl_expression?(ctx: Dshl_expressionContext): void {
        const idenetifier = ctx.IDENTIFIER();
        if (idenetifier) {
            const position = idenetifier.symbol.startIndex;
            const vd = this.snapshot.variableDeclarations.find(
                (vd) => vd.name === idenetifier.text && position >= vd.nameEndPosition
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
                this.snapshot.variableUsages.push(vu);
                vd.usages.push(vu);
            }
        }
        this.visitChildren(ctx);
    }

    protected defaultResult(): void {}
}
