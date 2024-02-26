import { DocumentUri, Range } from 'vscode-languageserver';
import { VariableUsage } from './variable-usage';

export interface VariableDeclaration {
    type: string;
    name: string;
    nameOriginalRange: Range;
    originalRange: Range;
    nameEndPosition: number;
    usages: VariableUsage[];
    isVisible: boolean;
    uri: DocumentUri;
}
