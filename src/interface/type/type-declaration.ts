import { DocumentUri, Range } from 'vscode-languageserver';
import { VariableDeclaration, toStringVariableDeclaration } from '../variable/variable-declaration';
import { TypeUsage } from './type-usage';

export interface TypeDeclaration {
    name: string;
    nameOriginalRange: Range;
    originalRange: Range;
    usages: TypeUsage[];
    members: VariableDeclaration[];
    isVisible: boolean;
    uri: DocumentUri;
    isBuiltIn: boolean;
}

export function toStringTypeDeclaration(td: TypeDeclaration): string {
    const header = `struct ${td.name}`;
    let members = '';
    for (const member of td.members) {
        members += `\t${toStringVariableDeclaration(member)}\n`;
    }
    return `${header} {\n${members}};`;
}
