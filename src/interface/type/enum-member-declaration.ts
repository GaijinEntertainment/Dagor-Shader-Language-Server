import { DocumentUri, Range } from 'vscode-languageserver';
import { EnumDeclaration } from './enum-declaration';
import { EnumMemberUsage } from './enum-member-usage';

export interface EnumMemberDeclaration {
    enumDeclaration: EnumDeclaration;
    name: string;
    nameOriginalRange: Range;
    originalRange: Range;
    usages: EnumMemberUsage[];
    isVisible: boolean;
    uri: DocumentUri;
    value?: number;
}

export function toStringEnumMemberDeclaration(declaration: EnumMemberDeclaration): string {
    const enumType = `${declaration.enumDeclaration.name}::${declaration.name}`;
    const assignment = declaration.value != undefined ? ` = ${declaration.value}` : '';
    return enumType + assignment;
}
