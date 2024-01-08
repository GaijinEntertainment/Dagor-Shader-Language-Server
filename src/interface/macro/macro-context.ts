import { Range } from 'vscode-languageserver';

import { MacroStatement } from './macro-statement';

export interface MacroContext {
    macro: MacroStatement;
    startPosition: number;
    endPosition: number;
    originalRange: Range;
    originalNameRange: Range;
    parent: MacroContext | null;
    children: MacroContext[];
    isNotVisible: boolean;
}
