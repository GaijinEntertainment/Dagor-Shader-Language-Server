import { Hover, HoverParams, MarkupContent, MarkupKind } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { toStringMacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroUsage, getBestMacroDeclaration } from '../interface/macro/macro-usage';

export async function hoverProvider(params: HoverParams): Promise<Hover | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const mu = snapshot.macroUsages.find((mu) => mu.isVisible && rangeContains(mu.nameOriginalRange, params.position));
    if (!mu || !mu.macro.declarations.length) {
        return null;
    }
    return {
        contents: createHoverContent(mu),
        range: mu.nameOriginalRange,
    };
}

function createHoverContent(mu: MacroUsage): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getValue(mu),
    };
}

function getValue(mu: MacroUsage): string {
    const md = mu.macroDeclaration ?? getBestMacroDeclaration(mu);
    if (!md) {
        return '';
    }
    const macroHeader = toStringMacroDeclaration(md);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`dshl\n${macroHeader}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return macroHeader;
    } else {
        return '';
    }
}
