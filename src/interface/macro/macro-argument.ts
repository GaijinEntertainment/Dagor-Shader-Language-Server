import { Position, Range } from 'vscode-languageserver';

export interface MacroArgument {
    content: string;
    originalRange: Range;
    trimmedOriginalStartPosition: Position;
}
