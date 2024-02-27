export interface FunctionParameter {
    name: string;
    type: string;
}

export function toStringFunctionParameter(fp: FunctionParameter): string {
    return `${fp.type} ${fp.name}`;
}
