import { Range } from 'vscode-languageserver';
import { Argument } from './argument';

export interface Arguments {
    endPosition: number;
    argumentListOriginalRange: Range;
    argumentListPosition: number;
    argumentListEndPosition: number;
    arguments: Argument[];
}
