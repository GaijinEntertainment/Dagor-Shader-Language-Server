import { Range } from 'vscode-languageserver';
import { EnumDeclaration } from './type/enum-declaration';
import { TypeDeclaration } from './type/type-declaration';

interface TypeExpressionRange {
    type: 'type';
    originalRange: Range;
    typeDeclaration: TypeDeclaration;
}

interface EnumExpressionRange {
    type: 'enum';
    originalRange: Range;
    enumDeclaration: EnumDeclaration;
}

export type ExpressionRange = TypeExpressionRange | EnumExpressionRange;
