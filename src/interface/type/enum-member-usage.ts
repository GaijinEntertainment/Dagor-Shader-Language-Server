import { Range } from 'vscode-languageserver';
import { EnumMemberDeclaration } from './enum-member-declaration';

export interface EnumMemberUsage {
    originalRange: Range;
    declaration: EnumMemberDeclaration;
    isVisible: boolean;
}
