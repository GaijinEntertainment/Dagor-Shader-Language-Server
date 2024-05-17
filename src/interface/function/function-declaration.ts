import { DocumentUri, Range } from 'vscode-languageserver';
import { FunctionParameter, toStringFunctionParameter } from './function-parameter';
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
}

export function toStringFunctionDeclaration(fd: FunctionDeclaration): string {
    const parameters = toStringFunctionParameters(fd.parameters);
    return `${fd.type} ${fd.name}(${parameters});`;
}

export function toStringFunctionParameters(fps: FunctionParameter[]): string {
    return fps.map((fp) => toStringFunctionParameter(fp)).join(', ');
}
