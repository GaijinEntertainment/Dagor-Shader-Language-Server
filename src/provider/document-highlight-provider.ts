import {
    DocumentHighlight,
    DocumentHighlightKind,
    DocumentHighlightParams,
} from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { Snapshot } from '../core/snapshot';
import { rangeContains } from '../helper/helper';
import { MacroStatement } from '../interface/macro/macro-statement';

export async function documentHighlightProvider(
    params: DocumentHighlightParams
): Promise<DocumentHighlight[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const ms = getMacroStatement(snapshot, params);
    if (!ms) {
        return null;
    }
    const result: DocumentHighlight[] = [];
    if (ms.uri === params.textDocument.uri) {
        result.push({
            range: ms.nameOriginalRange,
            kind: DocumentHighlightKind.Text,
        });
    }
    for (const mc of ms.usages.filter((msa) => !msa.isNotVisible)) {
        result.push({
            range: mc.nameOriginalRange,
            kind: DocumentHighlightKind.Text,
        });
    }
    return result;
}

function getMacroStatement(
    snapshot: Snapshot,
    dhp: DocumentHighlightParams
): MacroStatement | null {
    const ms = snapshot.macroStatements.find(
        (ms) =>
            ms.uri === dhp.textDocument.uri &&
            rangeContains(ms.nameOriginalRange, dhp.position)
    );
    if (ms) {
        return ms;
    }
    const mc = snapshot.macroContexts.find(
        (mc) =>
            !mc.isNotVisible &&
            rangeContains(mc.nameOriginalRange, dhp.position)
    );
    if (mc) {
        return mc.macroStatement;
    }
    return null;
}
