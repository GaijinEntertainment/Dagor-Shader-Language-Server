import { PrepareRenameParams, Range } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';

export async function prepareRenameProvider(params: PrepareRenameParams): Promise<
    | Range
    | {
          range: Range;
          placeholder: string;
      }
    | {
          defaultBehavior: boolean;
      }
    | null
    | undefined
> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const position = params.position;
    const md = snapshot.getMacroDeclarationAt(position);
    if (md) {
        return md.nameOriginalRange;
    }
    const mu = snapshot.getMacroUsageAt(position);
    if (mu) {
        return mu.nameOriginalRange;
    }
    const mp = snapshot.getMacroParameter(params.position, params.textDocument.uri);
    if (mp) {
        return mp.originalRange;
    }
    const ds = snapshot.getDefineStatementAt(position);
    if (ds) {
        return ds.nameOriginalRange;
    }
    const dc = snapshot.getDefineContextAt(position);
    if (dc) {
        return dc.nameOriginalRange;
    }
    const td = snapshot.getTypeDeclarationAt(position);
    if (td) {
        return td.nameOriginalRange;
    }
    const tu = snapshot.getTypeUsageAt(position);
    if (tu && !tu.declaration.isBuiltIn) {
        return tu.originalRange;
    }
    const ed = snapshot.getEnumDeclarationAt(position);
    if (ed) {
        return ed.nameOriginalRange;
    }
    const eu = snapshot.getEnumUsageAt(position);
    if (eu && !eu.declaration.isBuiltIn) {
        return eu.originalRange;
    }
    const emd = snapshot.getEnumMemberDeclarationAt(position);
    if (emd) {
        return emd.nameOriginalRange;
    }
    const emu = snapshot.getEnumMemberUsageAt(position);
    if (emu && !emu.declaration.enumDeclaration.isBuiltIn) {
        return emu.originalRange;
    }
    const vd = snapshot.getVariableDeclarationAt(position);
    if (vd) {
        return vd.nameOriginalRange;
    }
    const vu = snapshot.getVariableUsageAt(position);
    if (vu && !vu.declaration.isBuiltIn) {
        return vu.originalRange;
    }
    const id = snapshot.getIntervalDeclarationAt(position);
    if (id) {
        return id.nameOriginalRange;
    }
    const fd = snapshot.getFunctionDeclarationAt(position);
    if (fd) {
        return fd.nameOriginalRange;
    }
    const fu = snapshot.getFunctionUsageAt(position);
    if (fu?.declaration && !fu.declaration.isBuiltIn) {
        return fu.nameOriginalRange;
    }
    const sd = snapshot.getShaderDeclarationAt(position);
    if (sd) {
        return sd.nameOriginalRange;
    }
    const su = snapshot.getShaderUsageAt(position);
    if (su) {
        return su.originalRange;
    }
    const bd = snapshot.getBlockDeclarationAt(position);
    if (bd) {
        return bd.nameOriginalRange;
    }
    const bu = snapshot.getBlockUsageAt(position);
    if (bu) {
        return bu.originalRange;
    }
    return null;
}
