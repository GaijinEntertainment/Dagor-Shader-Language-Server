import { EnumDeclaration } from './type/enum-declaration';
import { TypeDeclaration } from './type/type-declaration';

interface TypeExpressionResult {
    type: 'type';
    typeDeclaration: TypeDeclaration;
    arraySizes: number[];
}

interface EnumExpressionResult {
    type: 'enum';
    enumDeclaration: EnumDeclaration;
    arraySizes: number[];
}

export type ExpressionResult = TypeExpressionResult | EnumExpressionResult;
