import { Hover, HoverParams, MarkupContent, MarkupKind } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { toStringBlockDeclaration } from '../interface/block/block-declaration';
import { BlockUsage } from '../interface/block/block-usage';
import { DefineContext } from '../interface/define-context';
import { toStringDefineStatementWithContent } from '../interface/define-statement';
import { toStringFunctionDeclaration } from '../interface/function/function-declaration';
import { toStringFunctionParameters } from '../interface/function/function-parameter';
import { FunctionUsage } from '../interface/function/function-usage';
import { toStringIntrinsicFunction } from '../interface/function/intrinsic-function';
import { toStringMacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroUsage, getBestMacroDeclaration } from '../interface/macro/macro-usage';
import { getShaderInfo } from '../interface/shader/shader-declaration';
import { getEnumInfo } from '../interface/type/enum-declaration';
import { getEnumMemberInfo } from '../interface/type/enum-member-declaration';
import { getTypeInfo } from '../interface/type/type-declaration';
import { getVariableInfo } from '../interface/variable/variable-declaration';

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
    const tu = snapshot.getTypeUsageAt(params.position);
    if (tu) {
        return {
            contents: getTypeInfo(tu.declaration, getCapabilities().hoverFormat) ?? [],
            range: tu.originalRange,
        };
    }
    const eu = snapshot.getEnumUsageAt(params.position);
    if (eu) {
        return {
            contents: getEnumInfo(eu.declaration, getCapabilities().hoverFormat) ?? [],
            range: eu.originalRange,
        };
    }
    const emu = snapshot.getEnumMemberUsageAt(params.position);
    if (emu) {
        return {
            contents: getEnumMemberInfo(emu.declaration, getCapabilities().hoverFormat) ?? [],
            range: emu.originalRange,
        };
    }
    const id = snapshot.getIntervalDeclarationAt(params.position);
    if (id) {
        return {
            contents: getVariableInfo(id.variable, getCapabilities().hoverFormat) ?? [],
            range: id.nameOriginalRange,
        };
    }
    const vu = snapshot.getVariableUsageAt(params.position);
    if (vu) {
        return {
            contents: getVariableInfo(vu.declaration, getCapabilities().hoverFormat) ?? [],
            range: vu.originalRange,
        };
    }
    const fu = snapshot.getFunctionUsageAt(params.position);
    if (fu) {
        return {
            contents: createFunctionHoverContent(fu),
            range: fu.nameOriginalRange,
        };
    }
    const su = snapshot.getShaderUsageAt(params.position);
    if (su) {
        return {
            contents: getShaderInfo(su.declaration, getCapabilities().hoverFormat) ?? [],
            range: su.originalRange,
        };
    }
    const bu = snapshot.getBlockUsageAt(params.position);
    if (bu) {
        return {
            contents: createBlockHoverContent(bu),
            range: bu.originalRange,
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

function createFunctionHoverContent(fu: FunctionUsage): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getFunctionValue(fu),
    };
}

function getFunctionValue(fu: FunctionUsage): string {
    const declaration = getFunctionDeclarationValue(fu);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        let result = `\`\`\`hlsl\n${declaration}\n\`\`\``;
        if (fu.intrinsicFunction?.description) {
            result += '\n' + fu.intrinsicFunction.description;
        }
        return result;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        let result = declaration;
        if (fu.intrinsicFunction?.description) {
            result += '\n' + fu.intrinsicFunction.description;
        }
        return result;
    } else {
        return '';
    }
}

function getFunctionDeclarationValue(fu: FunctionUsage): string {
    if (fu.declaration) {
        return toStringFunctionDeclaration(fu.declaration);
    } else if (fu.intrinsicFunction) {
        return toStringIntrinsicFunction(fu.intrinsicFunction!);
    } else if (fu.method) {
        const parameters = toStringFunctionParameters(fu.method.parameters);
        return `${fu.method.returnType} ${fu.method.name}(${parameters});`;
    }
    return '';
}

function createBlockHoverContent(bu: BlockUsage): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getBlockValue(bu),
    };
}

function getBlockValue(bu: BlockUsage): string {
    const sd = bu.declaration;
    const declaration = toStringBlockDeclaration(sd);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`dshl\n${declaration}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return declaration;
    } else {
        return '';
    }
}
