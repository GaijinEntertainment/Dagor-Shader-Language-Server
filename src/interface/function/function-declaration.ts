import { FunctionParameter, toStringFunctionParameter } from './function-parameter';
import { FunctionUsage } from './function-usage';

export interface FunctionDeclaration {
    name: string;
    parameters: FunctionParameter[];
    type: string;
    usages: FunctionUsage[];
}

export function toStringFunctionDeclaration(fd: FunctionDeclaration): string {
    const parameters = toStringFunctionParameters(fd.parameters);
    return `${fd.type} ${fd.name}(${parameters});`;
}

export function toStringFunctionParameters(fps: FunctionParameter[]): string {
    return fps.map((fp) => toStringFunctionParameter(fp)).join(', ');
}
