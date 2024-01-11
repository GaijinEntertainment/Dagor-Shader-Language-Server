import { Range } from 'vscode-languageserver';

import { MacroContextBase } from './macro-context-base';

export interface MacroContext extends MacroContextBase {
    startPosition: number;
    endPosition: number;
    originalRange: Range;
    nameOriginalRange: Range;
    parent: MacroContext | null;
    children: MacroContext[];
}
