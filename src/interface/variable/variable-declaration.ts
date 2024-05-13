import { DocumentUri, MarkupContent, MarkupKind, Range } from 'vscode-languageserver';

import { getInfo } from '../../helper/helper';
import { IntervalDeclaration } from '../interval-declaration';
import { EnumDeclaration } from '../type/enum-declaration';
import { TypeDeclaration } from '../type/type-declaration';
import { VariableUsage } from './variable-usage';

export interface VariableDeclaration {
    type: string;
    typeDeclaration?: TypeDeclaration;
    enumDeclaration?: EnumDeclaration;
    name: string;
    nameOriginalRange: Range;
    originalRange: Range;
    nameEndPosition: number;
    usages: VariableUsage[];
    isVisible: boolean;
    uri: DocumentUri;
    interval?: IntervalDeclaration;
    isHlsl: boolean;
    arraySizes: number[];
    containerType?: TypeDeclaration;
    description?: string;
}

export function getVariableInfo(vd: VariableDeclaration, formats: MarkupKind[]): MarkupContent | undefined {
    return getInfo(
        formats,
        toStringVariableDeclaration(vd),
        vd.description,
        vd?.containerType?.links,
        vd.isHlsl ? 'hlsl' : 'dshl'
    );
}

export function toStringVariableType(vd: VariableDeclaration, array = true): string {
    let result = vd.type;
    if (vd.typeDeclaration) {
        result = vd.typeDeclaration.name ?? '<anonymous>';
    } else if (vd.enumDeclaration) {
        result = vd.enumDeclaration.name ?? '<anonymous>';
    }
    if (array) {
        result += toStringArray(vd.arraySizes);
    }
    return result;
}

export function toStringVariableDeclaration(vd: VariableDeclaration): string {
    const type = toStringVariableType(vd, false);
    const array = toStringArray(vd.arraySizes);
    return `${type} ${vd.name}${array};`;
}

function toStringArray(arraySizes: number[]): string {
    return arraySizes.map((size) => `[${Number.isNaN(size) ? '' : size}]`).join('');
}
