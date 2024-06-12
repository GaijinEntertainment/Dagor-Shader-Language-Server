import { Range } from 'vscode-languageserver';
import { Method } from '../language-element-info';
import { FunctionArgument } from './function-argument';
import { FunctionDeclaration } from './function-declaration';
import { IntrinsicFunction } from './intrinsic-function';

export interface FunctionUsage {
    declaration?: FunctionDeclaration;
    intrinsicFunction?: IntrinsicFunction;
    methods: Method[];
    originalRange: Range;
    nameOriginalRange: Range;
    parameterListOriginalRange: Range;
    arguments: FunctionArgument[];
    isVisible: boolean;
}
