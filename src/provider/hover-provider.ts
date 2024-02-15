import { Hover, HoverParams, MarkupContent, MarkupKind } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { DefineContext } from '../interface/define-context';
import { toStringDefineStatementWithContent } from '../interface/define-statement';
import { toStringMacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroUsage, getBestMacroDeclaration } from '../interface/macro/macro-usage';

export async function hoverProvider(params: HoverParams): Promise<Hover | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const mu = snapshot.macroUsages.find((mu) => mu.isVisible && rangeContains(mu.nameOriginalRange, params.position));
    if (mu?.macro?.declarations?.length) {
        return {
            contents: createMacroHoverContent(mu),
            range: mu.nameOriginalRange,
        };
    }
    const dc = snapshot.defineContexts.find(
        (dc) => dc.isVisible && rangeContains(dc.nameOriginalRange, params.position)
    );
    if (dc) {
        return {
            contents: createDefineHoverContent(dc),
            range: dc.nameOriginalRange,
        };
    }
    return null;
}

function createMacroHoverContent(mu: MacroUsage): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getMacroValue(mu),
    };
}

function getMacroValue(mu: MacroUsage): string {
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

function createDefineHoverContent(dc: DefineContext): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getDefineValue(dc),
    };
}

function getDefineValue(dc: DefineContext): string {
    const ds = dc.define;
    if (!ds) {
        return '';
    }
    const define = toStringDefineStatementWithContent(ds);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        let result = `\`\`\`hlsl\n${define}\n\`\`\``;
        if (dc.expansion !== null) {
            result += `\nExpands to:\n\`\`\`hlsl\n${dc.expansion}\n\`\`\``;
        }
        return result;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        if (dc.expansion === null) {
            return define;
        } else {
            return `${define}\nExpands to:\n${dc.expansion}`;
        }
    } else {
        return '';
    }
}
