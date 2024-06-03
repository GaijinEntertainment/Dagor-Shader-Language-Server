import { Location, ReferenceParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';

export async function referencesProvider(params: ReferenceParams): Promise<Location[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const macro = snapshot.getMacro(params.position, params.textDocument.uri);
    if (macro) {
        const result: Location[] = [];
        for (const md of macro.declarations) {
            result.push({
                range: md.nameOriginalRange,
                uri: md.uri,
            });
        }
        for (const mu of macro.usages.filter((mu) => mu.isVisible)) {
            result.push({
                range: mu.nameOriginalRange,
                uri: params.textDocument.uri,
            });
        }
        return result;
    }
    const mp = snapshot.getMacroParameter(params.position, params.textDocument.uri);
    if (mp) {
        const result: Location[] = [];
        result.push({
            range: mp.originalRange,
            uri: params.textDocument.uri,
        });
        for (const mpu of mp.usages) {
            result.push({
                range: mpu.originalRange,
                uri: params.textDocument.uri,
            });
        }
        return result;
    }
    const ds = snapshot.getDefineStatement(params.position, params.textDocument.uri);
    if (ds) {
        const result: Location[] = [];
        if (ds.isVisible && !ds.isPredefined && ds.uri === params.textDocument.uri) {
            result.push({
                range: ds.nameOriginalRange,
                uri: ds.uri,
            });
        }
        for (const dc of ds.usages.filter((dc) => dc.isVisible)) {
            result.push({
                range: dc.nameOriginalRange,
                uri: params.textDocument.uri,
            });
        }
        return result;
    }
    const td = snapshot.getTypeDeclaration(params.position);
    if (td) {
        const result: Location[] = [];
        if (td.isVisible && td.uri === params.textDocument.uri) {
            result.push({
                range: td.nameOriginalRange,
                uri: td.uri,
            });
        }
        for (const tu of td.usages) {
            if (tu.isVisible) {
                result.push({
                    range: tu.originalRange,
                    uri: params.textDocument.uri,
                });
            }
        }
        return result;
    }
    const ed = snapshot.getEnumDeclaration(params.position);
    if (ed && ed.nameOriginalRange) {
        const result: Location[] = [];
        if (ed.isVisible && ed.uri === params.textDocument.uri) {
            result.push({
                range: ed.nameOriginalRange,
                uri: ed.uri,
            });
        }
        for (const eu of ed.usages) {
            if (eu.isVisible) {
                result.push({
                    range: eu.originalRange,
                    uri: params.textDocument.uri,
                });
            }
        }
        return result;
    }
    const emd = snapshot.getEnumMemberDeclaration(params.position);
    if (emd && emd.nameOriginalRange) {
        const result: Location[] = [];
        if (emd.isVisible && emd.uri === params.textDocument.uri) {
            result.push({
                range: emd.nameOriginalRange,
                uri: emd.uri,
            });
        }
        for (const eu of emd.usages) {
            if (eu.isVisible) {
                result.push({
                    range: eu.originalRange,
                    uri: params.textDocument.uri,
                });
            }
        }
        return result;
    }
    const vd = snapshot.getVariableDeclaration(params.position);
    if (vd) {
        const result: Location[] = [];
        if (vd.isVisible && vd.uri === params.textDocument.uri) {
            result.push({
                range: vd.nameOriginalRange,
                uri: vd.uri,
            });
        }
        if (vd.interval && vd.interval.isVisible && vd.interval.uri === params.textDocument.uri) {
            result.push({
                range: vd.interval.nameOriginalRange,
                uri: vd.interval.uri,
            });
        }
        for (const vu of vd.usages) {
            if (vu.isVisible) {
                result.push({
                    range: vu.originalRange,
                    uri: params.textDocument.uri,
                });
            }
        }
        return result;
    }
    const fd = snapshot.getFunctionDeclaration(params.position);
    if (fd) {
        const result: Location[] = [];
        if (fd.isVisible && fd.uri === params.textDocument.uri) {
            result.push({
                range: fd.nameOriginalRange,
                uri: fd.uri,
            });
        }
        for (const fu of fd.usages) {
            if (fu.isVisible) {
                result.push({
                    range: fu.nameOriginalRange,
                    uri: params.textDocument.uri,
                });
            }
        }
        return result;
    }
    const fu = snapshot.getFunctionUsageAt(params.position);
    if (fu && fu.intrinsicFunction) {
        const result: Location[] = [];
        const ifd = fu.intrinsicFunction;
        for (const fu of ifd.usages) {
            if (fu.isVisible) {
                result.push({
                    range: fu.nameOriginalRange,
                    uri: params.textDocument.uri,
                });
            }
        }
        return result;
    }
    const sd = snapshot.getShaderDeclaration(params.position);
    if (sd) {
        const result: Location[] = [];
        if (sd.isVisible && sd.uri === params.textDocument.uri) {
            result.push({
                range: sd.nameOriginalRange,
                uri: sd.uri,
            });
        }
        for (const su of sd.usages) {
            if (su.isVisible) {
                result.push({
                    range: su.originalRange,
                    uri: params.textDocument.uri,
                });
            }
        }
        return result;
    }
    const bd = snapshot.getBlockDeclaration(params.position);
    if (bd) {
        const result: Location[] = [];
        if (bd.isVisible && bd.uri === params.textDocument.uri) {
            result.push({
                range: bd.nameOriginalRange,
                uri: bd.uri,
            });
        }
        for (const bu of bd.usages) {
            if (bu.isVisible) {
                result.push({
                    range: bu.originalRange,
                    uri: params.textDocument.uri,
                });
            }
        }
        return result;
    }
    return null;
}
