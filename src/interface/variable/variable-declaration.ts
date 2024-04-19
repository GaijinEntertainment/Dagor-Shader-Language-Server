import { DocumentUri, Range } from 'vscode-languageserver';
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
}

export function getVariableTypeWithInterval(vd: VariableDeclaration): string {
    const interval = vd.interval ? 'interval ' : '';
    return interval + vd.type;
}

export function toStringVariableDeclaration(vd: VariableDeclaration): string {
    return `${vd.type} ${vd.name};`;
}
