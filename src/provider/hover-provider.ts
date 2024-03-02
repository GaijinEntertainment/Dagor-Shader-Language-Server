import { Hover, HoverParams, MarkupContent, MarkupKind } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { DefineContext } from '../interface/define-context';
import { toStringDefineStatementWithContent } from '../interface/define-statement';
import { toStringFunctionDeclaration } from '../interface/function/function-declaration';
import { FunctionUsage } from '../interface/function/function-usage';
import { toStringMacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroUsage, getBestMacroDeclaration } from '../interface/macro/macro-usage';
import { VariableUsage } from '../interface/variable/variable-usage';

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
    const vu = snapshot.getVariableUsageAt(params.position);
    if (vu) {
        return {
            contents: createVariableHoverContent(vu),
            range: vu.originalRange,
        };
    }
    const fu = snapshot.getFunctioneUsageAt(params.position);
    if (fu) {
        return {
            contents: createFunctionHoverContent(fu),
            range: fu.nameOriginalRange,
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

function createVariableHoverContent(vu: VariableUsage): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getVariableValue(vu),
    };
}

function getVariableValue(vu: VariableUsage): string {
    const vd = vu.declaration;
    const declaration = `${vd.type} ${vd.name};`;
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`dshl\n${declaration}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return declaration;
    } else {
        return '';
    }
}

function createFunctionHoverContent(fu: FunctionUsage): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getFunctionValue(fu),
    };
}

function getFunctionValue(fu: FunctionUsage): string {
    const fd = fu.declaration;
    const declaration = toStringFunctionDeclaration(fd);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`hlsl\n${declaration}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return declaration;
    } else {
        return '';
    }
}
