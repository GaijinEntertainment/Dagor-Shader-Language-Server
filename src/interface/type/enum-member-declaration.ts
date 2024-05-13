import { DocumentUri, MarkupContent, MarkupKind, Range } from 'vscode-languageserver';
import { getInfo } from '../../helper/helper';
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
    value?: string;
    description?: string;
}

export function getEnumMemberInfo(emd: EnumMemberDeclaration, formats: MarkupKind[]): MarkupContent | undefined {
    return getInfo(formats, toStringEnumMemberDeclaration(emd), emd.description, emd.enumDeclaration.links);
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
