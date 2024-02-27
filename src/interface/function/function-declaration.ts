import { FunctionParameter, toStringFunctionParameter } from './function-parameter';
import { FunctionUsage } from './function-usage';

export interface FunctionDeclaration {
    name: string;
    parameters: FunctionParameter[];
    type: string;
    usages: FunctionUsage[];
}

export function toStringFunctionDeclaration(fd: FunctionDeclaration): string {
    const parameters = `${fd.parameters.map((fp) => toStringFunctionParameter(fp)).join(', ')}`;
    return `${fd.type} ${fd.name}(${parameters});`;
}
