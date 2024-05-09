import { Hover, HoverParams, MarkupContent, MarkupKind } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { toStringBlockDeclaration } from '../interface/block/block-declaration';
import { BlockUsage } from '../interface/block/block-usage';
import { DefineContext } from '../interface/define-context';
import { toStringDefineStatementWithContent } from '../interface/define-statement';
import { toStringFunctionDeclaration } from '../interface/function/function-declaration';
import { FunctionUsage } from '../interface/function/function-usage';
import { toStringMacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroUsage, getBestMacroDeclaration } from '../interface/macro/macro-usage';
import { toStringShaderDeclaration } from '../interface/shader/shader-declaration';
import { ShaderUsage } from '../interface/shader/shader-usage';
import { EnumDeclaration, toStringEnumDeclaration } from '../interface/type/enum-declaration';
import { EnumMemberDeclaration, toStringEnumMemberDeclaration } from '../interface/type/enum-member-declaration';
import { TypeDeclaration, toStringTypeDeclaration } from '../interface/type/type-declaration';
import { VariableDeclaration } from '../interface/variable/variable-declaration';

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
            contents: createTypeHoverContent(tu.declaration),
            range: tu.originalRange,
        };
    }
    const eu = snapshot.getEnumUsageAt(params.position);
    if (eu) {
        return {
            contents: createEnumHoverContent(eu.declaration),
            range: eu.originalRange,
        };
    }
    const emu = snapshot.getEnumMemberUsageAt(params.position);
    if (emu) {
        return {
            contents: createEnumMemberHoverContent(emu.declaration),
            range: emu.originalRange,
        };
    }
    const id = snapshot.getIntervalDeclarationAt(params.position);
    if (id) {
        return {
            contents: createVariableHoverContent(id.variable),
            range: id.nameOriginalRange,
        };
    }
    const vu = snapshot.getVariableUsageAt(params.position);
    if (vu) {
        return {
            contents: createVariableHoverContent(vu.declaration),
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
            contents: createShaderHoverContent(su),
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

function createTypeHoverContent(td: TypeDeclaration): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getTypeValue(td),
    };
}

function getTypeValue(td: TypeDeclaration): string {
    const declaration = toStringTypeDeclaration(td);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`hlsl\n${declaration}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return declaration;
    } else {
        return '';
    }
}

function createEnumHoverContent(ed: EnumDeclaration): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getEnumValue(ed),
    };
}

function getEnumValue(ed: EnumDeclaration): string {
    const declaration = toStringEnumDeclaration(ed);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`hlsl\n${declaration}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return declaration;
    } else {
        return '';
    }
}

function createEnumMemberHoverContent(emd: EnumMemberDeclaration): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getEnumMemberValue(emd),
    };
}

function getEnumMemberValue(emd: EnumMemberDeclaration): string {
    const declaration = toStringEnumMemberDeclaration(emd);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`hlsl\n${declaration}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return declaration;
    } else {
        return '';
    }
}

function createVariableHoverContent(vd: VariableDeclaration): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getVariableValue(vd),
    };
}

function getVariableValue(vd: VariableDeclaration): string {
    const declaration = `${vd.type ? vd.type : '<anonymous>'} ${vd.name};`;
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        const language = vd.isHlsl ? 'hlsl' : 'dshl';
        return `\`\`\`${language}\n${declaration}\n\`\`\``;
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

function createShaderHoverContent(su: ShaderUsage): MarkupContent {
    return {
        kind: getCapabilities().hoverFormat.includes(MarkupKind.Markdown) ? MarkupKind.Markdown : MarkupKind.PlainText,
        value: getShaderValue(su),
    };
}

function getShaderValue(su: ShaderUsage): string {
    const sd = su.declaration;
    const declaration = toStringShaderDeclaration(sd);
    if (getCapabilities().hoverFormat.includes(MarkupKind.Markdown)) {
        return `\`\`\`dshl\n${declaration}\n\`\`\``;
    } else if (getCapabilities().hoverFormat.includes(MarkupKind.PlainText)) {
        return declaration;
    } else {
        return '';
    }
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
