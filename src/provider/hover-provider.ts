import {
    Hover,
    HoverParams,
    MarkupContent,
    MarkupKind,
} from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { MacroContext } from '../interface/macro/macro-context';
import { toStringMacroStatement } from '../interface/macro/macro-statement';

export async function hoverProvider(
    params: HoverParams
): Promise<Hover | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const mc = snapshot.macroContexts
        .filter((mc) => !mc.isNotVisible)
        .find((mc) => rangeContains(mc.nameOriginalRange, params.position));
    if (!mc) {
        return null;
    }
    return {
        contents: createHoverContent(mc),
        range: mc.nameOriginalRange,
    };
}

function createHoverContent(mc: MacroContext): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown)
            ? MarkupKind.Markdown
            : MarkupKind.PlainText,
        value: getValue(mc),
    };
}

function getValue(mc: MacroContext): string {
    const ms = mc.macroStatement;
    const macroHeader = toStringMacroStatement(ms);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`dshl\n${macroHeader}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return macroHeader;
    } else {
        return '';
    }
}
