import { Range } from 'vscode-languageserver';
import { FunctionArgument } from './function-argument';
import { FunctionDeclaration } from './function-declaration';

export interface FunctionUsage {
    declaration: FunctionDeclaration;
    originalRange: Range;
    nameOriginalRange: Range;
    parameterListOriginalRange: Range;
    arguments: FunctionArgument[];
    isVisible: boolean;
}
