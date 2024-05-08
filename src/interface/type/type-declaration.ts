import { DocumentUri, Range } from 'vscode-languageserver';

import { VariableDeclaration, toStringVariableDeclaration } from '../variable/variable-declaration';
import { EnumDeclaration, toStringEnumDeclaration } from './enum-declaration';
import { TypeUsage } from './type-usage';

export type TypeKeyword = 'struct' | 'class' | 'interface';

export interface TypeDeclaration {
    type: TypeKeyword;
    name: string;
    nameOriginalRange: Range;
    originalRange: Range;
    usages: TypeUsage[];
    members: VariableDeclaration[];
    isVisible: boolean;
    uri: DocumentUri;
    isBuiltIn: boolean;
    superTypes: TypeDeclaration[];
    subTypes: TypeDeclaration[];
    embeddedTypes: TypeDeclaration[];
    embeddedEnums: EnumDeclaration[];
}

export function toStringTypeDeclaration(td: TypeDeclaration, depth = 0): string {
    const header = '\t'.repeat(depth) + toStringTypeDeclarationHeader(td);
    let members = '';
    for (const member of td.members) {
        members += '\t'.repeat(depth + 1) + `${toStringVariableDeclaration(member)}\n`;
    }
    let embeddedTypes = '';
    for (const etd of td.embeddedTypes) {
        embeddedTypes += toStringTypeDeclaration(etd, depth + 1) + '\n';
    }
    let embeddedEnums = '';
    for (const eed of td.embeddedEnums) {
        embeddedEnums += toStringEnumDeclaration(eed, depth + 1) + '\n';
    }
    return `${header} {\n${members}${embeddedTypes}${embeddedEnums}` + '\t'.repeat(depth) + '};';
}

function toStringTypeDeclarationHeader(td: TypeDeclaration): string {
    let result = td.type;
    if (td.name) {
        result += ' ' + td.name;
    }
    if (td.superTypes.length) {
        result += ' : ' + td.superTypes.map((td) => td.name).join(', ');
    }
    return result;
}
