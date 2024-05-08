import { EnumDeclaration } from './type/enum-declaration';
import { TypeDeclaration } from './type/type-declaration';

interface TypeExpressionResult {
    type: 'type';
    typeDeclaration: TypeDeclaration;
}

interface EnumExpressionResult {
    type: 'enum';
    enumDeclaration: EnumDeclaration;
}

export type ExpressionResult = TypeExpressionResult | EnumExpressionResult;
