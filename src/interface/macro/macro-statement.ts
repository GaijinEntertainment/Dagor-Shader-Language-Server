import { DocumentUri, Position, Range } from 'vscode-languageserver';

import { MacroContextBase } from './macro-context-base';
import { MacroType } from './macro-type';

export interface MacroStatement {
    uri: DocumentUri;
    position: number;
    originalRange: Range;
    nameOriginalRange: Range;
    codeCompletionPosition: Position;
    name: string;
    parameters: string[];
    content: string;
    type: MacroType;
    usages: MacroContextBase[];
}

export function toStringMacroStatement(macro: MacroStatement): string {
    const keyword =
        macro.type === MacroType.MACRO
            ? 'macro'
            : 'define_macro_if_not_defined';
    const parameters = macro.parameters.join(', ');
    return `${keyword} ${macro.name}(${parameters})`;
}
