import { DocumentUri, InlayHint, InlayHintKind, InlayHintParams, Position, Range } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { positionsEqual, rangeContains } from '../helper/helper';
import { DefineContext } from '../interface/define-context';
import { FunctionParameter } from '../interface/function/function-parameter';
import { FunctionUsage } from '../interface/function/function-usage';
import { MacroUsage, getBestMacroDeclaration } from '../interface/macro/macro-usage';

export async function inlayHintProvider(params: InlayHintParams): Promise<InlayHint[] | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const result: InlayHint[] = [];
    const mus = snapshot.macroUsages.filter(
        (mu) =>
            mu.isVisible &&
            (rangeContains(params.range, mu.nameOriginalRange.start) ||
                rangeContains(params.range, mu.nameOriginalRange.end))
    );
    addMacroArguments(result, mus);
    const dcs = snapshot.defineContexts.filter(
        (dc) =>
            !dc.define.objectLike &&
            dc.isVisible &&
            (rangeContains(params.range, dc.nameOriginalRange.start) ||
                rangeContains(params.range, dc.nameOriginalRange.end))
    );
    addDefineArguments(result, dcs);
    const fus = snapshot.getFunctionUsagesIn(params.range);
    addFunctionArguments(result, fus);
    return result;
}

function addMacroArguments(result: InlayHint[], mus: MacroUsage[]): void {
    for (const mu of mus) {
        const md = mu.macroDeclaration ?? getBestMacroDeclaration(mu);
        if (md) {
            for (let i = 0; i < mu.arguments.length && i < md.parameters.length; i++) {
                const ma = mu.arguments[i];
                const mp = md.parameters[i];
                const ih = createInlayHint(mp.name, ma.trimmedOriginalStartPosition, mp.originalRange, md.uri);
                result.push(ih);
            }
        }
    }
}

function addDefineArguments(result: InlayHint[], dcs: DefineContext[]): void {
    for (const dc of dcs) {
        if (dc.arguments) {
            for (let i = 0; i < dc.arguments.arguments.length && i < dc.define.parameters.length; i++) {
                const da = dc.arguments.arguments[i];
                const dp = dc.define.parameters[i];
                const ih = createInlayHint(dp, da.trimmedOriginalStartPosition);
                result.push(ih);
            }
        }
    }
}

function addFunctionArguments(result: InlayHint[], fus: FunctionUsage[]): void {
    for (const fu of fus) {
        const parameters = getParameters(fu);
        if (fu.arguments.length) {
            for (let i = 0; i < fu.arguments.length && i < parameters.length; i++) {
                const fa = fu.arguments[i];
                const fp = parameters[i];
                const ih = createInlayHint(fp.name, fa.trimmedOriginalStartPosition);
                if (!result.find((r) => positionsEqual(r.position, ih.position))) {
                    result.push(ih);
                }
            }
        }
    }
}

function getParameters(fu: FunctionUsage): FunctionParameter[] {
    if (fu.declaration) {
        return fu.declaration.parameters;
    } else if (fu.intrinsicFunction) {
        return fu.intrinsicFunction.parameters;
    } else if (fu.methods.length) {
        return fu.methods[0].parameters;
    }
    return [];
}

function createInlayHint(name: string, position: Position, originalRange?: Range, uri?: DocumentUri): InlayHint {
    const location = originalRange ? { range: originalRange, uri: uri ?? '' } : undefined;
    return {
        label: [
            {
                value: `${name}:`,
                location,
            },
        ],
        position,
        kind: InlayHintKind.Parameter,
        paddingRight: true,
    };
}
