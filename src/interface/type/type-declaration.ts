import { DocumentUri, Range } from 'vscode-languageserver';
import { VariableDeclaration, toStringVariableDeclaration } from '../variable/variable-declaration';
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
}

export function toStringTypeDeclaration(td: TypeDeclaration): string {
    let superTypes = '';
    if (td.superTypes.length) {
        superTypes = ` : ${td.superTypes.map((td) => td.name).join(', ')}`;
    }
    const header = `${td.type} ${td.name}${superTypes}`;
    let members = '';
    for (const member of td.members) {
        members += `\t${toStringVariableDeclaration(member)}\n`;
    }
    return `${header} {\n${members}};`;
}
