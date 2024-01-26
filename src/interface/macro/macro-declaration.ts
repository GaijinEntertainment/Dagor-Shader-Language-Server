import { DocumentUri, Position, Range } from 'vscode-languageserver';

import { Snapshot } from '../../core/snapshot';
import { Macro } from './macro';
import { MacroParameter } from './macro-parameter';
import { MacroType } from './macro-type';

export interface MacroDeclaration {
    uri: DocumentUri;
    position: number;
    originalRange: Range;
    nameOriginalRange: Range;
    codeCompletionPosition: Position;
    contentOriginalRange: Range;
    contentSnapshot: Snapshot;
    name: string;
    parameters: MacroParameter[];
    type: MacroType;
    macro: Macro;
}

export function toStringMacroDeclaration(md: MacroDeclaration): string {
    const keyword = md.type === MacroType.MACRO ? 'macro' : 'define_macro_if_not_defined';
    const header = toStringMacroDeclarationHeader(md);
    return `${keyword} ${header}`;
}

export function toStringMacroDeclarationHeader(md: MacroDeclaration): string {
    const parameterList = toStringMacroDeclarationParameterList(md);
    return `${md.name}${parameterList}`;
}

export function toStringMacroDeclarationParameterList(md: MacroDeclaration): string {
    const parameters = md.parameters.map((mp) => mp.name).join(', ');
    return `(${parameters})`;
}
