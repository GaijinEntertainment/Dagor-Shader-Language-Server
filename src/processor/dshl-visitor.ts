import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { State_objectContext, Statement_blockContext, Type_declarationContext } from '../_generated/DshlParser';
import { DshlParserVisitor } from '../_generated/DshlParserVisitor';
import { Snapshot } from '../core/snapshot';

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

    protected defaultResult(): void {}
}
