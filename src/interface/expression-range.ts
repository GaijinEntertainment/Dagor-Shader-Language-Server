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

interface NameExpressionRange {
    type: 'name';
    originalRange: Range;
    name: string;
}

export type ExpressionRange = TypeExpressionRange | EnumExpressionRange | NameExpressionRange;
