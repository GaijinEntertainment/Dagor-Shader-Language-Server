import { DocumentUri, MarkupContent, MarkupKind, Range } from 'vscode-languageserver';
import { getInfo } from '../../helper/helper';
import { ShaderUsage } from './shader-usage';

export interface ShaderDeclaration {
    name: string;
    originalRange: Range;
    nameOriginalRange: Range;
    isVisible: boolean;
    uri: DocumentUri;
    usages: ShaderUsage[];
}

export function getShaderInfo(sd: ShaderDeclaration, formats: MarkupKind[]): MarkupContent | undefined {
    return getInfo(formats, toStringShaderDeclaration(sd), '', [], 'dshl');
}

export function toStringShaderDeclaration(sd: ShaderDeclaration): string {
    return 'shader ' + sd.name;
}
