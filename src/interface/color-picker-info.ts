import { Range } from 'vscode-languageserver';

export interface ColorPickerInfo {
    originalRange: Range;
    color: number[];
}
