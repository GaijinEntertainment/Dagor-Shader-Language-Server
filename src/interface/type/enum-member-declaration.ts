import { Range } from 'vscode-languageserver';

export interface EnumMemberDeclaration {
    name: string;
    nameOriginalRange: Range;
    originalRange: Range;
}
