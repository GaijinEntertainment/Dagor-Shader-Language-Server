import { DocumentHighlight, DocumentHighlightKind, DocumentHighlightParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';

export async function documentHighlightProvider(
    params: DocumentHighlightParams
): Promise<DocumentHighlight[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const macro = snapshot.getMacro(params.position);
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
    const mp = snapshot.getMacroParameter(params.position, params.textDocument.uri);
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
    const ds = snapshot.getDefineStatement(params.position);
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
