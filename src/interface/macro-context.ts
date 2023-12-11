import { MacroStatement } from './macro-statement';

export interface MacroContext {
    macro: MacroStatement;
    startPosition: number;
    endPosition: number;
    parent: MacroContext | null;
    children: MacroContext[];
}
