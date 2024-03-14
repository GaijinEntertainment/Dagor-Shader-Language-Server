import { FunctionParameter } from './function-parameter';

export interface FunctionInfo {
    name: string;
    description?: string;
    parameters: FunctionParameter[];
    type: string;
}
