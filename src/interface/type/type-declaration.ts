import { DocumentUri, Range } from 'vscode-languageserver';
import { VariableDeclaration } from '../variable/variable-declaration';
import { TypeUsage } from './type-usage';

export interface TypeDeclaration {
    name: string;
    nameOriginalRange: Range;
    originalRange: Range;
    usages: TypeUsage[];
    members: VariableDeclaration[];
    isVisible: boolean;
    uri: DocumentUri;
}
