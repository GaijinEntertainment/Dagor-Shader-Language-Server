import { DocumentUri, Range } from 'vscode-languageserver';

export interface MacroStatement {
    uri: DocumentUri;
    position: number;
    originalRange: Range;
    nameOriginalRange: Range;
    name: string;
    parameters: string[];
    content: string;
}
