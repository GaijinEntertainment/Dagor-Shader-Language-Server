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
    let result = '';
    if (declaration.enumDeclaration.name) {
        result += `${declaration.enumDeclaration.name}::`;
    }
    result += declaration.name;
    if (declaration.value != undefined) {
        result += ` = ${declaration.value}`;
    }
    return result;
}
