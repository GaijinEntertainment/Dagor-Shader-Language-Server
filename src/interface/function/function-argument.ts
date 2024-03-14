import { Position, Range } from 'vscode-languageserver';

export interface FunctionArgument {
    originalRange: Range;
    trimmedOriginalStartPosition: Position;
}
