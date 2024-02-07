import { DocumentHighlight, DocumentHighlightKind, DocumentHighlightParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { Snapshot } from '../core/snapshot';
import { rangeContains } from '../helper/helper';
import { DefineStatement } from '../interface/define-statement';
import { Macro } from '../interface/macro/macro';
import { MacroParameter } from '../interface/macro/macro-parameter';

export async function documentHighlightProvider(
    params: DocumentHighlightParams
): Promise<DocumentHighlight[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const macro = getMacro(snapshot, params);
    if (macro) {
        const result: DocumentHighlight[] = [];
        for (const md of macro.declarations.filter((md) => md.uri === params.textDocument.uri)) {
            result.push({
                range: md.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const mu of macro.usages.filter((mu) => mu.isVisible)) {
            result.push({
                range: mu.nameOriginalRange,
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
    const ds = getDefineStatement(snapshot, params);
    if (ds) {
        const result: DocumentHighlight[] = [];
        if (ds.isVisible) {
            result.push({
                range: ds.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const dc of ds.usages.filter((dc) => dc.isVisible)) {
            result.push({
                range: dc.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        return result;
    }
    return null;
}

function getMacro(snapshot: Snapshot, params: DocumentHighlightParams): Macro | null {
    const md = snapshot.macroDeclarations.find(
        (md) => md.uri === params.textDocument.uri && rangeContains(md.nameOriginalRange, params.position)
    );
    if (md) {
        return md.macro;
    }
    const mu = snapshot.macroUsages.find((mu) => mu.isVisible && rangeContains(mu.nameOriginalRange, params.position));
    if (mu) {
        return mu.macro;
    }
    return null;
}

function getDefineStatement(snapshot: Snapshot, params: DocumentHighlightParams): DefineStatement | null {
    const ds = snapshot.defineStatements.find(
        (ds) => ds.isVisible && rangeContains(ds.nameOriginalRange, params.position)
    );
    if (ds) {
        return ds;
    }
    const dc = snapshot.defineContexts.find(
        (dc) => dc.isVisible && rangeContains(dc.nameOriginalRange, params.position)
    );
    if (dc) {
        return dc.define;
    }
    return null;
}

function getMacroParameter(snapshot: Snapshot, params: DocumentHighlightParams): MacroParameter | null {
    const md =
        snapshot.macroDeclarations.find(
            (md) => md.uri === params.textDocument.uri && rangeContains(md.originalRange, params.position)
        ) ?? null;
    if (!md) {
        return null;
    }
    return (
        md.parameters.find(
            (mp) =>
                rangeContains(mp.originalRange, params.position) ||
                mp.usages.some((mpu) => rangeContains(mpu.originalRange, params.position))
        ) ?? null
    );
}
