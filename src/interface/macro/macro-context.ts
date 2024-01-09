import { Range } from 'vscode-languageserver';

import { MacroArgument } from './macro-argument';
import { MacroStatement } from './macro-statement';

export interface MacroContext {
    macroStatement: MacroStatement;
    startPosition: number;
    endPosition: number;
    originalRange: Range;
    nameOriginalRange: Range;
    parent: MacroContext | null;
    children: MacroContext[];
    isNotVisible: boolean;
    arguments: MacroArgument[];
}
