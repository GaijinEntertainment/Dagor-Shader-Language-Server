import { DocumentUri, Position, Range } from 'vscode-languageserver';

import { Snapshot } from '../../core/snapshot';
import { MacroContextBase } from './macro-context-base';
import { MacroParameter } from './macro-parameter';
import { MacroType } from './macro-type';

export interface MacroStatement {
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
    usages: MacroContextBase[];
}

export function toStringMacroStatement(ms: MacroStatement): string {
    const keyword = ms.type === MacroType.MACRO ? 'macro' : 'define_macro_if_not_defined';
    const header = toStringMacroStatementHeader(ms);
    return `${keyword} ${header}`;
}

export function toStringMacroStatementHeader(ms: MacroStatement): string {
    const parameterList = toStringMacroStatementParameterList(ms);
    return `${ms.name}${parameterList}`;
}

export function toStringMacroStatementParameterList(ms: MacroStatement): string {
    const parameters = ms.parameters.map((mp) => mp.name).join(', ');
    return `(${parameters})`;
}
