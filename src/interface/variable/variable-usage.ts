import { Range } from 'vscode-languageserver';
import { VariableDeclaration } from './variable-declaration';

export interface VariableUsage {
    originalRange: Range;
    declaration: VariableDeclaration;
    isVisible: boolean;
}
