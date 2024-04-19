import { Range } from 'vscode-languageserver';
import { EnumDeclaration } from './enum-declaration';

export interface EnumUsage {
    originalRange: Range;
    declaration: EnumDeclaration;
    isVisible: boolean;
}
