import { DocumentUri, Range } from 'vscode-languageserver';
import { EnumMemberDeclaration } from './enum-member-declaration';

export interface EnumDeclaration {
    name?: string;
    nameOriginalRange?: Range;
    type?: string;
    isClass: boolean;
    originalRange: Range;
    members: EnumMemberDeclaration[];
    isVisible: boolean;
    uri: DocumentUri;
}

export function toStringEnumDeclaration(ed: EnumDeclaration): string {
    const keywords = ed.isClass ? 'enum class' : 'enum';
    const name = ed.name ?? '';
    const type = ed.type ? `: ${ed.type}` : '';
    const header = `${keywords} ${name} ${type}`;
    let members = '';
    for (const member of ed.members) {
        members += `\t${member.name},\n`;
    }
    return `${header} {\n${members}}`;
}
