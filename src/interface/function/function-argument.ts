import { Position, Range } from 'vscode-languageserver';
import { ExpressionResult } from '../expression-result';

export interface FunctionArgument {
    originalRange: Range;
    trimmedOriginalStartPosition: Position;
    expressionResult: ExpressionResult | null;
}
