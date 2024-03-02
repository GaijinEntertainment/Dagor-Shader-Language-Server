import { DocumentHighlight, DocumentHighlightKind, DocumentHighlightParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { Snapshot } from '../core/snapshot';
import { rangeContains } from '../helper/helper';
import { DefineStatement } from '../interface/define-statement';
import { FunctionDeclaration } from '../interface/function/function-declaration';
import { Macro } from '../interface/macro/macro';
import { MacroParameter } from '../interface/macro/macro-parameter';
import { ShaderDeclaration } from '../interface/shader/shader-declaration';
import { VariableDeclaration } from '../interface/variable/variable-declaration';

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
    const vd = getVariableDeclaration(snapshot, params);
    if (vd) {
        const result: DocumentHighlight[] = [];
        if (vd.isVisible && vd.uri === params.textDocument.uri) {
            result.push({
                range: vd.nameOriginalRange,
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
    const fd = getFunctionDeclaration(snapshot, params);
    if (fd) {
        const result: DocumentHighlight[] = [];
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
    const sd = getShaderDeclaration(snapshot, params);
    if (sd) {
        const result: DocumentHighlight[] = [];
        if (sd.isVisible && sd.uri === params.textDocument.uri) {
            result.push({
                range: sd.nameOriginalRange,
                kind: DocumentHighlightKind.Text,
            });
        }
        for (const vu of sd.usages) {
            if (vu.isVisible) {
                result.push({
                    range: vu.originalRange,
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

function getVariableDeclaration(snapshot: Snapshot, params: DocumentHighlightParams): VariableDeclaration | null {
    const vd = snapshot.getVariableDeclarationAt(params.position);
    if (vd) {
        return vd;
    }
    const vu = snapshot.getVariableUsageAt(params.position);
    if (vu) {
        return vu.declaration;
    }
    return null;
}

function getFunctionDeclaration(snapshot: Snapshot, params: DocumentHighlightParams): FunctionDeclaration | null {
    const fu = snapshot.getFunctioneUsageAt(params.position);
    if (fu) {
        return fu.declaration;
    }
    return null;
}

function getShaderDeclaration(snapshot: Snapshot, params: DocumentHighlightParams): ShaderDeclaration | null {
    const sd = snapshot.getShaderDeclarationAt(params.position);
    if (sd) {
        return sd;
    }
    const su = snapshot.getShaderUsageAt(params.position);
    if (su) {
        return su.declaration;
    }
    return null;
}
