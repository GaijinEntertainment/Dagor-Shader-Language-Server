import { DocumentUri, Range, RenameParams, WorkspaceEdit } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';

export async function renameRequestProvider(params: RenameParams): Promise<WorkspaceEdit | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const result: WorkspaceEdit = {
        changes: {},
    };
    const macro = snapshot.getMacro(params.position);
    if (macro) {
        for (const md of macro.declarations.filter((md) => md.uri === params.textDocument.uri)) {
            addTextEdit(result, params.newName, md.nameOriginalRange, md.uri);
        }
        for (const mu of macro.usages.filter((mu) => mu.isVisible)) {
            addTextEdit(result, params.newName, mu.nameOriginalRange, params.textDocument.uri);
        }
        return result;
    }
    const mp = snapshot.getMacroParameter(params.position, params.textDocument.uri);
    if (mp) {
        addTextEdit(result, params.newName, mp.originalRange, params.textDocument.uri);
        for (const mpu of mp.usages) {
            addTextEdit(result, params.newName, mpu.originalRange, params.textDocument.uri);
        }
        return result;
    }
    const ds = snapshot.getDefineStatement(params.position);
    if (ds && !ds.isPredefined) {
        if (ds.isVisible && ds.uri === params.textDocument.uri) {
            addTextEdit(result, params.newName, ds.nameOriginalRange, ds.uri);
        }
        for (const dc of ds.usages.filter((dc) => dc.isVisible)) {
            addTextEdit(result, params.newName, dc.nameOriginalRange, params.textDocument.uri);
        }
        return result;
    }
    const td = snapshot.getTypeDeclaration(params.position);
    if (td && !td.isBuiltIn) {
        if (td.isVisible && td.uri === params.textDocument.uri) {
            addTextEdit(result, params.newName, td.nameOriginalRange, td.uri);
        }
        for (const tu of td.usages) {
            if (tu.isVisible) {
                addTextEdit(result, params.newName, tu.originalRange, params.textDocument.uri);
            }
        }
        return result;
    }
    const ed = snapshot.getEnumDeclaration(params.position);
    if (ed?.nameOriginalRange && !ed.isBuiltIn) {
        if (ed.isVisible && ed.uri === params.textDocument.uri) {
            addTextEdit(result, params.newName, ed.nameOriginalRange, ed.uri);
        }
        for (const eu of ed.usages) {
            if (eu.isVisible) {
                addTextEdit(result, params.newName, eu.originalRange, params.textDocument.uri);
            }
        }
        return result;
    }
    const emd = snapshot.getEnumMemberDeclaration(params.position);
    if (emd && !emd.enumDeclaration.isBuiltIn) {
        if (emd.isVisible && emd.uri === params.textDocument.uri) {
            addTextEdit(result, params.newName, emd.nameOriginalRange, emd.uri);
        }
        for (const emu of emd.usages) {
            if (emu.isVisible) {
                addTextEdit(result, params.newName, emu.originalRange, params.textDocument.uri);
            }
        }
        return result;
    }
    const vd = snapshot.getVariableDeclaration(params.position);
    if (vd && !vd.isBuiltIn) {
        if (vd.isVisible && vd.uri === params.textDocument.uri) {
            addTextEdit(result, params.newName, vd.nameOriginalRange, vd.uri);
        }
        if (vd.interval && vd.interval.isVisible && vd.interval.uri === params.textDocument.uri) {
            addTextEdit(result, params.newName, vd.interval.nameOriginalRange, vd.interval.uri);
        }
        for (const vu of vd.usages) {
            if (vu.isVisible) {
                addTextEdit(result, params.newName, vu.originalRange, params.textDocument.uri);
            }
        }
        return result;
    }
    const fd = snapshot.getFunctionDeclaration(params.position);
    if (fd && !fd.isBuiltIn) {
        if (fd.isVisible && fd.uri === params.textDocument.uri) {
            addTextEdit(result, params.newName, fd.nameOriginalRange, fd.uri);
        }
        for (const fu of fd.usages) {
            if (fu.isVisible) {
                addTextEdit(result, params.newName, fu.nameOriginalRange, params.textDocument.uri);
            }
        }
        return result;
    }
    const sd = snapshot.getShaderDeclaration(params.position);
    if (sd) {
        if (sd.isVisible && sd.uri === params.textDocument.uri) {
            addTextEdit(result, params.newName, sd.nameOriginalRange, sd.uri);
        }
        for (const su of sd.usages) {
            if (su.isVisible) {
                addTextEdit(result, params.newName, su.originalRange, params.textDocument.uri);
            }
        }
        return result;
    }
    const bd = snapshot.getBlockDeclaration(params.position);
    if (bd) {
        if (bd.isVisible && bd.uri === params.textDocument.uri) {
            addTextEdit(result, params.newName, bd.nameOriginalRange, bd.uri);
        }
        for (const bu of bd.usages) {
            if (bu.isVisible) {
                addTextEdit(result, params.newName, bu.originalRange, params.textDocument.uri);
            }
        }
        return result;
    }
    return null;
}

function addTextEdit(result: WorkspaceEdit, text: string, range: Range, uri: DocumentUri): void {
    let textEdits = result.changes![uri];
    if (!textEdits) {
        textEdits = [];
        result.changes![uri] = textEdits;
    }
    textEdits.push({ range, newText: text });
}
