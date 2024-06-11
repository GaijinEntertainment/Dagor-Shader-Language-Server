import { Range } from 'vscode-languageserver';
import { EnumDeclaration } from './type/enum-declaration';
import { TypeDeclaration } from './type/type-declaration';

export interface TypeExpressionRange {
    type: 'type';
    originalRange: Range;
    typeDeclaration: TypeDeclaration;
}

export interface EnumExpressionRange {
    type: 'enum';
    originalRange: Range;
    enumDeclaration: EnumDeclaration;
}

export interface NameExpressionRange {
    type: 'name';
    originalRange: Range;
    name: string;
}

export type ExpressionRange = TypeExpressionRange | EnumExpressionRange | NameExpressionRange;
