import { DocumentUri, Range } from 'vscode-languageserver';
import { FunctionParameter, toStringFunctionParameters } from './function-parameter';
import { FunctionUsage } from './function-usage';

export interface FunctionDeclaration {
    name: string;
    originalRange: Range;
    nameOriginalRange: Range;
    parameters: FunctionParameter[];
    type: string;
    usages: FunctionUsage[];
    isVisible: boolean;
    uri: DocumentUri;
    isHlsl: boolean;
    isBuiltIn: boolean;
}

export function toStringFunctionDeclaration(fd: FunctionDeclaration): string {
    const parameters = toStringFunctionParameters(fd.parameters);
    return `${fd.type} ${fd.name}(${parameters});`;
}
