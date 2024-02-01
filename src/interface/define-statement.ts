import { Position, Range } from 'vscode-languageserver';

export interface DefineStatement {
    position: number;
    nameOriginalRange: Range;
    objectLike: boolean;
    name: string;
    parameters: string[];
    content: string;
    undefPosition: number | null;
    codeCompletionPosition: Position;
    undefCodeCompletionPosition: Position | null;
}
