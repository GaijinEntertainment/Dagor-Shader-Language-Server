import { Range } from 'vscode-languageserver';
import { MacroArgument } from './macro-argument';

export interface MacroArguments {
    endPosition: number;
    argumentListOriginalRange: Range;
    arguments: MacroArgument[];
}
