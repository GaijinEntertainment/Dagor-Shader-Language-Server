import { DocumentUri, Location, LocationLink, Position } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { defaultRange, rangeContains } from '../helper/helper';
import { BlockDeclaration } from '../interface/block/block-declaration';
import { DefineStatement } from '../interface/define-statement';
import { IncludeStatement } from '../interface/include/include-statement';
import { Macro } from '../interface/macro/macro';
import { MacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroParameter } from '../interface/macro/macro-parameter';
import { ShaderDeclaration } from '../interface/shader/shader-declaration';
import { EnumDeclaration } from '../interface/type/enum-declaration';
import { TypeDeclaration } from '../interface/type/type-declaration';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { getIncludedDocumentUri } from '../processor/include-resolver';

export async function linkProviderBase(
    position: Position,
    uri: DocumentUri,
    linkSupport: boolean,
    type: 'declaration' | 'definition' | 'implementation' | 'typeDefinition'
): Promise<LocationLink[] | Location | null> {
    const snapshot = await getSnapshot(uri);
    if (!snapshot) {
        return null;
    }
    const vd = snapshot.getVariableDeclarationAt(position);
    const vu = snapshot.getVariableUsageAt(position);
    if (type === 'typeDefinition') {
        if (vd?.typeDeclaration) {
            return getTypeDeclarationLocation(vd.typeDeclaration, linkSupport);
        }
        if (vd?.enumDeclaration) {
            return getEnumDeclarationLocation(vd.enumDeclaration, linkSupport);
        }
        if (vu?.declaration?.typeDeclaration) {
            return getTypeDeclarationLocation(vu.declaration.typeDeclaration, linkSupport);
        }
        if (vu?.declaration?.enumDeclaration) {
            return getEnumDeclarationLocation(vu.declaration.enumDeclaration, linkSupport);
        }
        return null;
    }
    let md = snapshot.macroDeclarations.find((md) => md.uri === uri && rangeContains(md.nameOriginalRange, position));
    if (md) {
        return getMacroDeclarationLocation(md.macro, linkSupport, md);
    }
    const mu = snapshot.macroUsages.find((mu) => mu.isVisible && rangeContains(mu.nameOriginalRange, position));
    if (mu) {
        return getMacroDeclarationLocation(mu.macro, linkSupport);
    }
    const ds = snapshot.defineStatements.find((ds) => ds.isVisible && rangeContains(ds.nameOriginalRange, position));
    if (ds) {
        return getDefineDeclarationLocation(ds, linkSupport);
    }
    const dc = snapshot.defineContexts.find(
        (dc) =>
            dc.isVisible &&
            rangeContains(dc.nameOriginalRange, position) &&
            (type !== 'implementation' || !dc.define.objectLike)
    );
    if (dc && !dc.define.isPredefined) {
        return getDefineDeclarationLocation(dc.define.realDefine ?? dc.define, linkSupport);
    }
    const sd = snapshot.getShaderDeclarationAt(position);
    if (sd) {
        return getShaderDeclarationLocation(sd, linkSupport);
    }
    const su = snapshot.getShaderUsageAt(position);
    if (su) {
        return getShaderDeclarationLocation(su.declaration, linkSupport);
    }
    const bd = snapshot.getBlockDeclarationAt(position);
    if (bd) {
        return getBlockDeclarationLocation(bd, linkSupport);
    }
    const bu = snapshot.getBlockUsageAt(position);
    if (bu) {
        return getBlockDeclarationLocation(bu.declaration, linkSupport);
    }
    const is = snapshot.includeStatements.find(
        (is) => is.includerUri === uri && rangeContains(is.pathOriginalRange, position)
    );
    if (is) {
        return await getIncludeStatementLocation(is, linkSupport);
    }
    const td = snapshot.getTypeDeclarationAt(position);
    if (td) {
        return getTypeDeclarationLocation(td, linkSupport);
    }
    const tu = snapshot.getTypeUsageAt(position);
    if (tu) {
        return getTypeDeclarationLocation(tu.declaration, linkSupport);
    }
    const ed = snapshot.getEnumDeclarationAt(position);
    if (ed) {
        return getEnumDeclarationLocation(ed, linkSupport);
    }
    const eu = snapshot.getEnumUsageAt(position);
    if (eu) {
        return getEnumDeclarationLocation(eu.declaration, linkSupport);
    }
    if (type === 'implementation') {
        return null;
    }
    if (vd) {
        return getVariableDeclarationLocation(vd, linkSupport);
    }
    if (vu) {
        return getVariableDeclarationLocation(vu.declaration, linkSupport);
    }
    const id = snapshot.getIntervalDeclarationAt(position);
    if (id) {
        return getVariableDeclarationLocation(id.variable, linkSupport);
    }
    md = snapshot.macroDeclarations.find((md) => md.uri === uri && rangeContains(md.originalRange, position));
    if (md) {
        const mp = md.parameters.find((mp) =>
            mp.usages.some(
                (mpu) => rangeContains(mp.originalRange, position) || rangeContains(mpu.originalRange, position)
            )
        );
        if (mp) {
            return getParameterLocation(mp, md.uri, linkSupport);
        }
    }
    return null;
}

function getMacroDeclarationLocation(
    macro: Macro,
    linkSupport: boolean,
    sourceMd?: MacroDeclaration
): LocationLink[] | Location {
    if (linkSupport) {
        return macro.declarations.map((md) => ({
            targetRange: md.originalRange,
            targetSelectionRange: md.nameOriginalRange,
            targetUri: md.uri,
        }));
    } else {
        const md = sourceMd ?? macro.declarations[0];
        return {
            range: md.nameOriginalRange,
            uri: md.uri,
        };
    }
}

function getDefineDeclarationLocation(ds: DefineStatement, linkSupport: boolean): LocationLink[] | Location {
    if (linkSupport) {
        return [
            {
                targetRange: ds.originalRange,
                targetSelectionRange: ds.nameOriginalRange,
                targetUri: ds.uri,
            },
        ];
    } else {
        return {
            range: ds.nameOriginalRange,
            uri: ds.uri,
        };
    }
}

function getParameterLocation(mp: MacroParameter, uri: DocumentUri, linkSupport: boolean): LocationLink[] | Location {
    if (linkSupport) {
        return [
            {
                targetRange: mp.originalRange,
                targetSelectionRange: mp.originalRange,
                targetUri: uri,
            },
        ];
    } else {
        return {
            range: mp.originalRange,
            uri,
        };
    }
}

function getTypeDeclarationLocation(td: TypeDeclaration, linkSupport: boolean): LocationLink[] | Location {
    if (linkSupport) {
        return [
            {
                targetRange: td.originalRange,
                targetSelectionRange: td.nameOriginalRange,
                targetUri: td.uri,
            },
        ];
    } else {
        return {
            range: td.nameOriginalRange,
            uri: td.uri,
        };
    }
}

function getEnumDeclarationLocation(ed: EnumDeclaration, linkSupport: boolean): LocationLink[] | Location | null {
    if (!ed.nameOriginalRange) {
        return null;
    }
    if (linkSupport) {
        return [
            {
                targetRange: ed.originalRange,
                targetSelectionRange: ed.nameOriginalRange,
                targetUri: ed.uri,
            },
        ];
    } else {
        return {
            range: ed.nameOriginalRange,
            uri: ed.uri,
        };
    }
}

function getVariableDeclarationLocation(vd: VariableDeclaration, linkSupport: boolean): LocationLink[] | Location {
    if (linkSupport) {
        return [
            {
                targetRange: vd.originalRange,
                targetSelectionRange: vd.nameOriginalRange,
                targetUri: vd.uri,
            },
        ];
    } else {
        return {
            range: vd.nameOriginalRange,
            uri: vd.uri,
        };
    }
}

function getShaderDeclarationLocation(sd: ShaderDeclaration, linkSupport: boolean): LocationLink[] | Location {
    if (linkSupport) {
        return [
            {
                targetRange: sd.originalRange,
                targetSelectionRange: sd.nameOriginalRange,
                targetUri: sd.uri,
            },
        ];
    } else {
        return {
            range: sd.nameOriginalRange,
            uri: sd.uri,
        };
    }
}

function getBlockDeclarationLocation(bd: BlockDeclaration, linkSupport: boolean): LocationLink[] | Location {
    if (linkSupport) {
        return [
            {
                targetRange: bd.originalRange,
                targetSelectionRange: bd.nameOriginalRange,
                targetUri: bd.uri,
            },
        ];
    } else {
        return {
            range: bd.nameOriginalRange,
            uri: bd.uri,
        };
    }
}

async function getIncludeStatementLocation(
    is: IncludeStatement,
    linkSupport: boolean
): Promise<LocationLink[] | Location> {
    const uri = await getIncludedDocumentUri(is);
    if (!uri) {
        return [];
    }
    if (linkSupport) {
        return [
            {
                targetRange: defaultRange,
                targetSelectionRange: defaultRange,
                originSelectionRange: is.pathOriginalRange,
                targetUri: uri,
            },
        ];
    } else {
        return {
            range: defaultRange,
            uri,
        };
    }
}
