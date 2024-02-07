import { Position, Range } from 'vscode-languageserver';

export interface DefineStatement {
    position: number;
    endPosition: number;
    originalRange: Range;
    nameOriginalRange: Range;
    objectLike: boolean;
    name: string;
    parameters: string[];
    content: string;
    undefPosition: number | null;
    codeCompletionPosition: Position;
    undefCodeCompletionPosition: Position | null;
    isVisible: boolean;
}

export function toStringDefineStatement(ds: DefineStatement): string {
    const header = toStringDefineStatementHeader(ds);
    return `#define ${header}`;
}

export function toStringDefineStatementHeader(ds: DefineStatement): string {
    if (ds.objectLike) {
        return ds.name;
    } else {
        const parameterList = toStringDefineStatementParameterList(ds);
        return `${ds.name}${parameterList}`;
    }
}

export function toStringDefineStatementParameterList(ds: DefineStatement): string {
    if (ds.objectLike) {
        return '';
    } else {
        const parameters = ds.parameters.join(', ');
        return `(${parameters})`;
    }
}
