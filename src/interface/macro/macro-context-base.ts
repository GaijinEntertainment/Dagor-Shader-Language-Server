import { Range } from 'vscode-languageserver';
import { MacroArgument } from './macro-argument';
import { MacroStatement } from './macro-statement';

export interface MacroContextBase {
    macroStatement: MacroStatement;
    parameterListOriginalRange: Range;
    isNotVisible: boolean;
    arguments: MacroArgument[];
}
