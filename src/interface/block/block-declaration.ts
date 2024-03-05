import { DocumentUri, Range } from 'vscode-languageserver';
import { BlockUsage } from './block-usage';

export interface BlockDeclaration {
    type: string;
    name: string;
    nameOriginalRange: Range;
    originalRange: Range;
    usages: BlockUsage[];
    isVisible: boolean;
    uri: DocumentUri;
}

export function toStringBlockDeclaration(bd: BlockDeclaration): string {
    const type = toStringBlockType(bd);
    return `${type} ${bd.name}`;
}

export function toStringBlockType(bd: BlockDeclaration): string {
    return `block(${bd.type})`;
}
