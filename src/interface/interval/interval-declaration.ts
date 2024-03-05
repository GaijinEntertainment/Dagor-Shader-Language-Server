import { DocumentUri, Range } from 'vscode-languageserver';
import { VariableDeclaration } from '../variable/variable-declaration';

export interface IntervalDeclaration {
    originalRange: Range;
    nameOriginalRange: Range;
    isVisible: boolean;
    uri: DocumentUri;
    variable: VariableDeclaration;
}
