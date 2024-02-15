import { Position, Range } from 'vscode-languageserver';

export interface Argument {
    content: string;
    originalRange: Range;
    position: number;
    endPosition: number;
    trimmedOriginalStartPosition: Position;
    trimmedStartPosition: number;
}
