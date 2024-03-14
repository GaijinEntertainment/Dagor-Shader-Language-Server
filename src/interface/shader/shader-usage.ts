import { Range } from 'vscode-languageserver';
import { ShaderDeclaration } from './shader-declaration';

export interface ShaderUsage {
    originalRange: Range;
    declaration: ShaderDeclaration;
    isVisible: boolean;
}
