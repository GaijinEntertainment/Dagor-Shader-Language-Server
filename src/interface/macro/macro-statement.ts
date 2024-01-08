import { DocumentUri, Range } from 'vscode-languageserver';

import { MacroType } from './macro-type';

export interface MacroStatement {
    uri: DocumentUri;
    position: number;
    originalRange: Range;
    nameOriginalRange: Range;
    name: string;
    parameters: string[];
    content: string;
    type: MacroType;
}
