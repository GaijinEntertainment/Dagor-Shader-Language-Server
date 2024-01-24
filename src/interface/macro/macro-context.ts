import { MacroDeclaration } from './macro-declaration';

export interface MacroContext {
    startPosition: number;
    endPosition: number;
    parent: MacroContext | null;
    children: MacroContext[];
    macroDeclaration: MacroDeclaration;
}
