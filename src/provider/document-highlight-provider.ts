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
        if (ds.isVisible && !ds.isPredefined && ds.uri === params.textDocument.uri) {
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
    const td = snapshot.getTypeDeclaration(params.position);
    if (td) {
        const result: DocumentHighlight[] = [];
        if (td.isVisible && td.uri === params.textDocument.uri) {
            result.push({
                range: td.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const tu of td.usages) {
            if (tu.isVisible) {
                result.push({
                    range: tu.originalRange,
                    kind: DocumentHighlightKind.Text,
                });
            }
        }
        return result;
    }
    const ed = snapshot.getEnumDeclaration(params.position);
    if (ed && ed.nameOriginalRange) {
        const result: DocumentHighlight[] = [];
        if (ed.isVisible && ed.uri === params.textDocument.uri) {
            result.push({
                range: ed.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const eu of ed.usages) {
            if (eu.isVisible) {
                result.push({
                    range: eu.originalRange,
                    kind: DocumentHighlightKind.Text,
                });
            }
        }
        return result;
    }
    const emd = snapshot.getEnumMemberDeclaration(params.position);
    if (emd && emd.nameOriginalRange) {
        const result: DocumentHighlight[] = [];
        if (emd.isVisible && emd.uri === params.textDocument.uri) {
            result.push({
                range: emd.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const eu of emd.usages) {
            if (eu.isVisible) {
                result.push({
                    range: eu.originalRange,
                    kind: DocumentHighlightKind.Text,
                });
            }
        }
        return result;
    }
    const vd = snapshot.getVariableDeclaration(params.position);
    if (vd) {
        const result: DocumentHighlight[] = [];
        if (vd.isVisible && vd.uri === params.textDocument.uri) {
            result.push({
                range: vd.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        if (vd.interval && vd.interval.isVisible && vd.interval.uri === params.textDocument.uri) {
            result.push({
                range: vd.interval.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const vu of vd.usages) {
            if (vu.isVisible) {
                result.push({
                    range: vu.originalRange,
                    kind: DocumentHighlightKind.Text,
                });
            }
        }
        return result;
    }
    const fd = snapshot.getFunctionDeclaration(params.position);
    if (fd) {
        const result: DocumentHighlight[] = [];
        if (fd.isVisible && fd.uri === params.textDocument.uri) {
            result.push({
                range: fd.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const fu of fd.usages) {
            if (fu.isVisible) {
                result.push({
                    range: fu.nameOriginalRange,
                    kind: DocumentHighlightKind.Text,
                });
            }
        }
        return result;
    }
    const fu = snapshot.getFunctionUsageAt(params.position);
    if (fu && fu.intrinsicFunction) {
        const result: DocumentHighlight[] = [];
        const ifd = fu.intrinsicFunction;
        for (const fu of ifd.usages) {
            if (fu.isVisible) {
                result.push({
                    range: fu.nameOriginalRange,
                    kind: DocumentHighlightKind.Text,
                });
            }
        }
        return result;
    }
    const sd = snapshot.getShaderDeclaration(params.position);
    if (sd) {
        const result: DocumentHighlight[] = [];
        if (sd.isVisible && sd.uri === params.textDocument.uri) {
            result.push({
                range: sd.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const su of sd.usages) {
            if (su.isVisible) {
                result.push({
                    range: su.originalRange,
                    kind: DocumentHighlightKind.Text,
                });
            }
        }
        return result;
    }
    const bd = snapshot.getBlockDeclaration(params.position);
    if (bd) {
        const result: DocumentHighlight[] = [];
        if (bd.isVisible && bd.uri === params.textDocument.uri) {
            result.push({
                range: bd.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const su of bd.usages) {
            if (su.isVisible) {
                result.push({
                    range: su.originalRange,
                    kind: DocumentHighlightKind.Text,
                });
            }
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
    const macroSnapshot = getSnapshotForMacroDefinition(snapshot, params);
    const ds = macroSnapshot.defineStatements.find(
        (ds) => ds.isVisible && rangeContains(ds.nameOriginalRange, params.position)
    );
    if (ds) {
        return ds.realDefine ?? ds;
    }
    const dc = snapshot.defineContexts.find(
        (dc) => dc.isVisible && rangeContains(dc.nameOriginalRange, params.position)
    );
    if (dc) {
        return dc.define.realDefine ?? dc.define;
    }
    return null;
}

function getSnapshotForMacroDefinition(snapshot: Snapshot, params: DocumentHighlightParams): Snapshot {
    const md = snapshot.macroDeclarations.find(
        (md) => md.uri === params.textDocument.uri && rangeContains(md.originalRange, params.position)
    );
    return md ? md.contentSnapshot : snapshot;
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
