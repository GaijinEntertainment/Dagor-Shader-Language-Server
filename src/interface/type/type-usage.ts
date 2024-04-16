import { Range } from 'vscode-languageserver';
import { TypeDeclaration } from './type-declaration';

export interface TypeUsage {
    originalRange: Range;
    declaration: TypeDeclaration;
    isVisible: boolean;
}
