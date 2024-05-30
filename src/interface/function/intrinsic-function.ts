import { FunctionParameter, toStringFunctionParameters } from './function-parameter';
import { FunctionUsage } from './function-usage';

export interface IntrinsicFunction {
    name: string;
    parameters: FunctionParameter[];
    type: string;
    usages: FunctionUsage[];
    description?: string;
}

export function toStringIntrinsicFunction(fd: IntrinsicFunction): string {
    const parameters = toStringFunctionParameters(fd.parameters);
    return `${fd.type} ${fd.name}(${parameters});`;
}
