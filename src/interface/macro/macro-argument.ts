import { Position } from 'vscode-languageserver';

export interface MacroArgument {
    content: string;
    originalPosition: Position;
}
