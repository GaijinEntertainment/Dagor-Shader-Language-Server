import { TypeKeyword } from './type/type-declaration';

export interface LanguageElementInfo {
    name: string;
    sortName?: string;
    insertText?: string;
    filterText?: string;
    isSnippet?: boolean;
    description?: string;
    links?: string[];
    type?: string;
    value?: string;
    keyword?: TypeKeyword | 'enum';
    members?: LanguageElementInfo[];
    additionalInfo?: string;
    overloads?: Overload[];
    available?: ShaderType[];
}

export interface Overload {
    returnType: TypeDescription | string;
    parameters: (Parameter | ConcreteParameter)[];
}

export interface TypeDescription {
    templateType: TemplateType[];
    componentType: ComponentType[];
    size: Size;
}

export interface Parameter extends TypeDescription {
    modifiers: string;
    name: string;
    description?: string;
}

export interface ConcreteParameter {
    modifiers: string;
    name: string;
    type: string;
    description?: string;
}

export type TemplateType = 'scalar' | 'vector' | 'matrix' | 'object' | 'same';
export type ComponentType =
    | 'float'
    | 'double'
    | 'int'
    | 'uint'
    | 'bool'
    | `sampler${1 | 2 | 3}D`
    | 'samplerCUBE'
    | 'same';
export type Size = 'any' | 'same' | number;
export type ShaderType = 'vertex' | 'hull' | 'domain' | 'geometry' | 'pixel' | 'compute';
