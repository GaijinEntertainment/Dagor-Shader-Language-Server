import { Hover, HoverParams, MarkupContent, MarkupKind } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { MacroContextBase } from '../interface/macro/macro-context-base';
import { toStringMacroStatement } from '../interface/macro/macro-statement';

export async function hoverProvider(params: HoverParams): Promise<Hover | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const pmc = snapshot.potentialMacroContexts.find(
        (pmc) => pmc.isVisible && rangeContains(pmc.nameOriginalRange, params.position)
    );
    if (!pmc) {
        return null;
    }
    return {
        contents: createHoverContent(pmc),
        range: pmc.nameOriginalRange,
    };
}

function createHoverContent(pmc: MacroContextBase): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getValue(pmc),
    };
}

function getValue(pmc: MacroContextBase): string {
    const ms = pmc.macroStatement;
    const macroHeader = toStringMacroStatement(ms);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`dshl\n${macroHeader}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return macroHeader;
    } else {
        return '';
    }
}
