import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';

import { ExpressionContext } from '../_generated/ConditionParser';
import { ConditionParserVisitor } from '../_generated/ConditionParserVisitor';
import { Snapshot } from '../core/snapshot';

export class ConditionVisitor
    extends AbstractParseTreeVisitor<bigint | null>
    implements ConditionParserVisitor<bigint | null>
{
    private snapshot: Snapshot;
    private position: number;

    public constructor(snapshot: Snapshot, position: number) {
        super();
        this.snapshot = snapshot;
        this.position = position;
    }

    public visitExpression?(ctx: ExpressionContext): bigint | null {
        if (this.isLiteral(ctx)) {
            return this.evaluateLiteral(ctx);
        }
        if (this.isUnaryExpression(ctx)) {
            return this.evaluateUnaryExpression(ctx);
        }
        if (this.isBinaryExpression(ctx)) {
            return this.evaluateBinaryExpression(ctx);
        }
        if (this.isTernaryExpression(ctx)) {
            return this.evaluateTernaryExpression(ctx);
        }
        if (this.isOtherExpression(ctx)) {
            return this.evaluateOtherExpression(ctx);
        }
        return null;
    }

    private isLiteral(ctx: ExpressionContext): boolean {
        return !!ctx.BOOL_LITERAL() || !!ctx.INT_LITERAL() || !!ctx.CHARACTER_LITERAL();
    }

    private evaluateLiteral(ctx: ExpressionContext): bigint | null {
        const boolLiteral = ctx.BOOL_LITERAL();
        if (boolLiteral) {
            return boolLiteral.text === 'true' ? 1n : 0n;
        }
        const intLiteral = ctx.INT_LITERAL();
        if (intLiteral) {
            try {
                const intLiteralWithoutSuffix = intLiteral.text.replace(/[uUlL]/, '');
                return BigInt(intLiteralWithoutSuffix);
            } catch (error) {
                return null;
            }
        }
        const charLiteral = ctx.CHARACTER_LITERAL();
        if (charLiteral) {
            return BigInt(charLiteral.text.charCodeAt(1));
        }
        return null;
    }

    private isUnaryExpression(ctx: ExpressionContext): boolean {
        return ctx.expression().length === 1;
    }

    private evaluateUnaryExpression(ctx: ExpressionContext): bigint | null {
        const exp = this.visit(ctx.expression(0));
        if (exp == null) {
            return null;
        }
        if (ctx.ADD()) {
            return exp;
        }
        if (ctx.SUBTRACT()) {
            return -exp;
        }
        if (ctx.LOGICAL_UNARY()) {
            return exp === 0n ? 1n : 0n;
        }
        if (ctx.BIT_UNARY()) {
            return ~exp;
        }
        return null;
    }

    private isBinaryExpression(ctx: ExpressionContext): boolean {
        return ctx.expression().length === 2;
    }

    private evaluateBinaryExpression(ctx: ExpressionContext): bigint | null {
        const exp0 = this.visit(ctx.expression(0));
        const exp1 = this.visit(ctx.expression(1));
        if (exp0 == null || exp1 == null) {
            return null;
        }
        if (ctx.MULTIPLY()) {
            return exp0 * exp1;
        }
        if (ctx.DIVIDE()) {
            if (exp1 === 0n) {
                return null;
            }
            return exp0 / exp1;
        }
        if (ctx.MODULO()) {
            if (exp1 === 0n) {
                return null;
            }
            return exp0 % exp1;
        }
        if (ctx.ADD()) {
            return exp0 + exp1;
        }
        if (ctx.SUBTRACT()) {
            return exp0 - exp1;
        }
        if (ctx.LEFT_SHIFT()) {
            return exp0 << exp1;
        }
        if (ctx.RIGHT_SHIFT()) {
            return exp0 >> exp1;
        }
        if (ctx.LESS()) {
            return exp0 < exp1 ? 1n : 0n;
        }
        if (ctx.LESS_EQUAL()) {
            return exp0 <= exp1 ? 1n : 0n;
        }
        if (ctx.GREATER()) {
            return exp0 > exp1 ? 1n : 0n;
        }
        if (ctx.GREATER_EQUAL()) {
            return exp0 >= exp1 ? 1n : 0n;
        }
        if (ctx.EQUAL()) {
            return exp0 === exp1 ? 1n : 0n;
        }
        if (ctx.NOT_EQUAL()) {
            return exp0 !== exp1 ? 1n : 0n;
        }
        if (ctx.BIT_AND()) {
            return exp0 & exp1;
        }
        if (ctx.BIT_XOR()) {
            return exp0 ^ exp1;
        }
        if (ctx.BIT_OR()) {
            return exp0 | exp1;
        }
        if (ctx.LOGICAL_AND()) {
            return exp0 && exp1 ? 1n : 0n;
        }
        if (ctx.LOGICAL_OR()) {
            return exp0 || exp1 ? 1n : 0n;
        }
        return null;
    }

    private isTernaryExpression(ctx: ExpressionContext): boolean {
        return ctx.expression().length === 3;
    }

    private evaluateTernaryExpression(ctx: ExpressionContext): bigint | null {
        const condition = this.visit(ctx.expression(0));
        if (condition == null) {
            return null;
        } else if (condition === 0n) {
            return this.visit(ctx.expression(2));
        } else {
            return this.visit(ctx.expression(1));
        }
    }

    private isOtherExpression(ctx: ExpressionContext): boolean {
        return !!ctx.DEFINED() || !!ctx.LRB() || !!ctx.IDENTIFIER();
    }

    private evaluateOtherExpression(ctx: ExpressionContext): bigint | null {
        const identifier = ctx.IDENTIFIER();
        if (ctx.DEFINED()) {
            return this.snapshot.isDefined(identifier?.text ?? '', this.position) ? 1n : 0n;
        }
        if (identifier) {
            return 0n;
        }
        if (ctx.LRB()) {
            return this.visit(ctx.expression(0));
        }
        return null;
    }

    protected defaultResult(): bigint | null {
        return null;
    }
}
