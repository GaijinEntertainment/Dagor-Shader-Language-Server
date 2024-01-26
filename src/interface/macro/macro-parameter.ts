import { Range } from 'vscode-languageserver';
import { MacroParameterUsage } from './macro-parameter-usage';

export interface MacroParameter {
    name: string;
    originalRange: Range;
    usages: MacroParameterUsage[];
}
