export interface FunctionParameter {
    modifiers?: string;
    name: string;
    type: string;
    description?: string;
}

export function toStringFunctionParameters(fps: FunctionParameter[]): string {
    return fps.map((fp) => toStringFunctionParameter(fp)).join(', ');
}

export function toStringFunctionParameter(fp: FunctionParameter): string {
    let result = `${fp.type} ${fp.name}`;
    if (fp.modifiers) {
        result = fp.modifiers + ' ' + result;
    }
    return result;
}
