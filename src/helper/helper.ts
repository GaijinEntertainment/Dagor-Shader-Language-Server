import { Position, Range } from 'vscode-languageserver';

export function rangesEqual(r1: Range, r2: Range): boolean {
    return positionsEqual(r1.start, r2.start) && positionsEqual(r1.end, r2.end);
}

export function positionsEqual(p1: Position, p2: Position): boolean {
    return p1.line === p2.line && p1.character === p2.character;
}

export function rangeContains(r: Range, p: Position): boolean {
    return (
        (p.line > r.start.line ||
            (p.line === r.start.line && p.character >= r.start.character)) &&
        (p.line < r.end.line ||
            (p.line === r.end.line && p.character <= r.end.character))
    );
}

export function rangeContainsRange(r: Range, r2: Range): boolean {
    return (
        (r2.start.line > r.start.line ||
            (r2.start.line === r.start.line &&
                r2.start.character >= r.start.character)) &&
        (r2.end.line < r.end.line ||
            (r2.end.line === r.end.line && r2.end.character <= r.end.character))
    );
}
