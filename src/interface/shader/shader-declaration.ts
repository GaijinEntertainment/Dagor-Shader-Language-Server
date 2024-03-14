import { DocumentUri, Range } from 'vscode-languageserver';
import { ShaderUsage } from './shader-usage';

export interface ShaderDeclaration {
    name: string;
    originalRange: Range;
    nameOriginalRange: Range;
    isVisible: boolean;
    uri: DocumentUri;
    usages: ShaderUsage[];
}

export function toStringShaderDeclaration(sd: ShaderDeclaration): string {
    return 'shader ' + sd.name;
}
