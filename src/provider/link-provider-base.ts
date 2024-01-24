import { DocumentUri, Location, LocationLink, Position } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { Macro } from '../interface/macro/macro';
import { MacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroParameter } from '../interface/macro/macro-parameter';

export async function linkProviderBase(
    position: Position,
    uri: DocumentUri,
    linkSupport: boolean,
    implementation = false
): Promise<LocationLink[] | Location | null> {
    const snapshot = await getSnapshot(uri);
    if (!snapshot) {
        return null;
    }
    let md = snapshot.macroDeclarations.find((md) => md.uri === uri && rangeContains(md.nameOriginalRange, position));
    if (md) {
        return getDeclarationLocation(md.macro, linkSupport, md);
    }
    const mu = snapshot.macroUsages.find((mu) => mu.isVisible && rangeContains(mu.nameOriginalRange, position));
    if (mu) {
        return getDeclarationLocation(mu.macro, linkSupport);
    }
    if (implementation) {
        return null;
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

function getDeclarationLocation(
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
