import { DocumentUri, Range } from 'vscode-languageserver';
import { IntervalDeclaration } from '../interval-declaration';
import { VariableUsage } from './variable-usage';

export interface VariableDeclaration {
    type: string;
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
