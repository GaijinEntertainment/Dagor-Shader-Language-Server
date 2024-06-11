import { ANTLRInputStream } from 'antlr4ts';
import { MarkupContent, MarkupKind, Position, Range, SymbolKind } from 'vscode-languageserver';
import { DshlLexer } from '../_generated/DshlLexer';
import { getCapabilities } from '../core/capability-manager';
import { Method } from '../interface/language-element-info';
import { TypeKeyword } from '../interface/type/type-declaration';
import { hlslBufferTypes, hlslTextureTypes } from './hlsl-info';

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

export function getTypeSymbolKind(type: TypeKeyword): SymbolKind {
    if (type === 'class') {
        return getKind(SymbolKind.Class);
    } else if (type === 'interface') {
        return getKind(SymbolKind.Interface);
    } else {
        return getKind(SymbolKind.Struct);
    }
}

export function getKind(kind: SymbolKind): SymbolKind {
    const kinds = getCapabilities().documentSymbolSymbolKinds;
    if (!kinds.length) {
        // if the array is empty, we should choose icon between file and array
        // however, in Visual Studio the array is empty, but it can still handle the predefined icons
        return kind;
    } else {
        return kinds.includes(kind) ? kind : SymbolKind.File;
    }
}

export function createDocumentationLinks(links: string[] | undefined): string {
    let result = '';
    if (links) {
        for (const link of links) {
            const linkName = getLinkName(link);
            result += `\n\n[${linkName}](${link})`;
        }
    }
    return result;
}

function getLinkName(link: string): string {
    let linkName = 'Open documentation';
    if (link.startsWith('https://microsoft.github.io/DirectX-Specs')) {
        linkName = 'Open DirectX Specs documentation';
    } else if (link.startsWith('https://learn.microsoft.com')) {
        linkName = 'Open Microsoft Learn documentation';
    } else if (link.startsWith('https://github.com/microsoft/DirectXShaderCompiler')) {
        linkName = 'Open DirectX Shader Compiler documentation';
    }
    return linkName;
}

export function getInfo(
    formats: MarkupKind[],
    declaration: string,
    description?: string,
    links?: string[],
    language: 'hlsl' | 'dshl' = 'hlsl'
): MarkupContent | undefined {
    const descriptionResult = description ? description + '\n' : '';
    if (formats.includes(MarkupKind.Markdown)) {
        const linksResult = createDocumentationLinks(links);
        return {
            kind: MarkupKind.Markdown,
            value: descriptionResult + '```' + language + '\n' + declaration + '\n```' + linksResult,
        };
    } else if (formats.includes(MarkupKind.PlainText)) {
        return {
            kind: MarkupKind.PlainText,
            value: descriptionResult + declaration,
        };
    } else {
        return undefined;
    }
}

export function getMethod(name: string): Method | null {
    let method = hlslBufferTypes.flatMap((b) => b.methods).find((m) => m && m.name === name);
    if (method) {
        return method;
    }
    method = hlslTextureTypes.flatMap((t) => t.methods).find((m) => m && m.name === name);
    if (method) {
        return method;
    }
    return null;
}
