import { DocumentUri, MarkupContent, MarkupKind, Range } from 'vscode-languageserver';

import { getInfo } from '../../helper/helper';
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
    isBuiltIn: boolean;
    description?: string;
    links?: string[];
}

export function getEnumInfo(ed: EnumDeclaration, formats: MarkupKind[]): MarkupContent | undefined {
    return getInfo(formats, toStringEnumDeclaration(ed), ed.description, ed.links);
}

export function toStringEnumDeclaration(ed: EnumDeclaration, depth = 0): string {
    const header = '\t'.repeat(depth) + toStringEnumDeclarationHeader(ed);
    let members = '';
    for (const member of ed.members) {
        members += '\t'.repeat(depth + 1) + `${member.name}`;
        if (member.value != undefined) {
            members += ` = ${member.value}`;
        }
        members += ',\n';
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
