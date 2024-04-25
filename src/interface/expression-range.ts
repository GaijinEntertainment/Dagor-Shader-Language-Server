import { Range } from 'vscode-languageserver';
import { TypeDeclaration } from './type/type-declaration';

export interface ExpressionRange {
    originalRange: Range;
    typeDeclaration: TypeDeclaration;
}
