import { Range } from 'vscode-languageserver';
import { MacroParameter } from './macro-parameter';

export interface MacroParameterUsage {
    name: string;
    originalRange: Range;
    macroParameter: MacroParameter;
}
