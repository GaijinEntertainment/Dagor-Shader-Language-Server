import { DocumentUri, Range } from 'vscode-languageserver';
import { EnumMemberDeclaration } from './enum-member-declaration';
import { EnumUsage } from './enum-usage';

export interface EnumDeclaration {
    name?: string;
    nameOriginalRange?: Range;
    type?: string;
    isClass: boolean;
    originalRange: Range;
    members: EnumMemberDeclaration[];
    usages: EnumUsage[];
    isVisible: boolean;
    uri: DocumentUri;
}

export function toStringEnumDeclaration(ed: EnumDeclaration, depth = 0): string {
    const header = '\t'.repeat(depth) + toStringEnumDeclarationHeader(ed);
    let members = '';
    for (const member of ed.members) {
        members += '\t'.repeat(depth + 1) + `${member.name},\n`;
    }
    return `${header} {\n${members}` + '\t'.repeat(depth) + '};';
}

function toStringEnumDeclarationHeader(ed: EnumDeclaration): string {
    let result = 'enum';
    if (ed.isClass) {
        result += ' class';
    }
    if (ed.name) {
        result += ' ' + ed.name;
    }
    if (ed.type) {
        result += ' : ' + ed.type;
    }
    return result;
}
