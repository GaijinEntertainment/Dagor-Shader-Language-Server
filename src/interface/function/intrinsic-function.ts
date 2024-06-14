import { FunctionParameter, toStringFunctionParameters } from './function-parameter';
import { FunctionUsage } from './function-usage';

export interface IntrinsicFunction {
    name: string;
    parameters: FunctionParameter[];
    type: string;
    usages: FunctionUsage[];
    description?: string;
}

export function toStringIntrinsicFunction(ifd: IntrinsicFunction): string {
    const parameters = toStringFunctionParameters(ifd.parameters);
    return `${ifd.type} ${ifd.name}(${parameters});`;
}
