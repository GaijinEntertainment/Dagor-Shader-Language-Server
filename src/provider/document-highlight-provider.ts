import { DocumentHighlight, DocumentHighlightKind, DocumentHighlightParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { Snapshot } from '../core/snapshot';
import { rangeContains } from '../helper/helper';
import { MacroParameter } from '../interface/macro/macro-parameter';
import { MacroStatement } from '../interface/macro/macro-statement';

export async function documentHighlightProvider(
    params: DocumentHighlightParams
): Promise<DocumentHighlight[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const ms = getMacroStatement(snapshot, params);
    if (ms) {
        const result: DocumentHighlight[] = [];
        if (ms.uri === params.textDocument.uri) {
            result.push({
                range: ms.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const mc of ms.usages.filter((msa) => msa.isVisible)) {
            result.push({
                range: mc.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        return result;
    }
    const mp = getMacroParameter(snapshot, params);
    if (mp) {
        const result: DocumentHighlight[] = [];
        result.push({
            range: mp.originalRange,
            kind: DocumentHighlightKind.Text,
        });
        for (const mpu of mp.usages) {
            result.push({
                range: mpu.originalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        return result;
    }
    return null;
}

function getMacroStatement(snapshot: Snapshot, params: DocumentHighlightParams): MacroStatement | null {
    const ms = snapshot.macroStatements.find(
        (ms) => ms.uri === params.textDocument.uri && rangeContains(ms.nameOriginalRange, params.position)
    );
    if (ms) {
        return ms;
    }
    const pmc = snapshot.potentialMacroContexts.find(
        (mc) => mc.isVisible && rangeContains(mc.nameOriginalRange, params.position)
    );
    if (pmc) {
        return pmc.macroStatement;
    }
    return null;
}

function getMacroParameter(snapshot: Snapshot, params: DocumentHighlightParams): MacroParameter | null {
    const ms =
        snapshot.macroStatements.find(
            (ms) => ms.uri === params.textDocument.uri && rangeContains(ms.originalRange, params.position)
        ) ?? null;
    if (!ms) {
        return null;
    }
    return (
        ms.parameters.find(
            (mp) =>
                rangeContains(mp.originalRange, params.position) ||
                mp.usages.some((mpu) => rangeContains(mpu.originalRange, params.position))
        ) ?? null
    );
}
