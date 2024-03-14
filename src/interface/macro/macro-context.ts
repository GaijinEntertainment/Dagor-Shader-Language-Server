import { Range } from 'vscode-languageserver';
import { MacroDeclaration } from './macro-declaration';

export interface MacroContext {
    startPosition: number;
    endPosition: number;
    originalRange: Range;
    parent: MacroContext | null;
    children: MacroContext[];
    macroDeclaration: MacroDeclaration;
}
