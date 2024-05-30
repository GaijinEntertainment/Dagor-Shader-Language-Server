import { Range } from 'vscode-languageserver';
import { FunctionArgument } from './function-argument';
import { FunctionDeclaration } from './function-declaration';
import { IntrinsicFunction } from './intrinsic-function';

export interface FunctionUsage {
    declaration?: FunctionDeclaration;
    intrinsicFunction?: IntrinsicFunction;
    originalRange: Range;
    nameOriginalRange: Range;
    parameterListOriginalRange: Range;
    arguments: FunctionArgument[];
    isVisible: boolean;
}
