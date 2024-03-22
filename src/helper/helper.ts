import { ANTLRInputStream } from 'antlr4ts';
import { Position, Range } from 'vscode-languageserver';
import { DshlLexer } from '../_generated/DshlLexer';

export const defaultPosition: Position = { line: 0, character: 0 };
export const defaultRange: Range = { start: defaultPosition, end: defaultPosition };

export function rangesEqual(r1: Range, r2: Range): boolean {
    return positionsEqual(r1.start, r2.start) && positionsEqual(r1.end, r2.end);
}

export function positionsEqual(p1: Position, p2: Position): boolean {
    return p1.line === p2.line && p1.character === p2.character;
}

export function rangeContains(r: Range, p: Position): boolean {
    return (
        (p.line > r.start.line || (p.line === r.start.line && p.character >= r.start.character)) &&
        (p.line < r.end.line || (p.line === r.end.line && p.character <= r.end.character))
    );
}

export function containsRange(range: Range, otherRange: Range): boolean {
    if (otherRange.start.line < range.start.line || otherRange.end.line < range.start.line) {
        return false;
    }
    if (otherRange.start.line > range.end.line || otherRange.end.line > range.end.line) {
        return false;
    }
    if (otherRange.start.line === range.start.line && otherRange.start.character < range.start.character) {
        return false;
    }
    if (otherRange.end.line === range.end.line && otherRange.end.character > range.end.character) {
        return false;
    }
    return true;
}

export function isBeforeOrEqual(p1: Position, p2: Position): boolean {
    return p1.line < p2.line || (p1.line === p2.line && p1.character <= p2.character);
}

export function isIntervalContains(startPosition: number, endPosition: number, position: number): boolean {
    return startPosition <= position && position <= endPosition;
}

export function offsetPosition(position: Position, offset: Position): void {
    if (position.line === 0) {
        position.line = offset.line;
        position.character += offset.character;
    } else {
        position.line += offset.line;
    }
}

export function createLexer(text: string): DshlLexer {
    //The ANTLRInputStream class is deprecated, however as far as I know this is the only way the TypeScript version of ANTLR accepts UTF-16 strings.
    //The CharStreams.fromString method only accepts UTF-8 and other methods of the CharStreams class are not implemented in TypeScript.
    const charStream = new ANTLRInputStream(text);
    const lexer = new DshlLexer(charStream);
    return lexer;
}
