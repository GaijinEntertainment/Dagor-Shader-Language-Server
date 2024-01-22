import { DocumentUri, Location, LocationLink, Position, Range } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';

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
    const pmc = snapshot.potentialMacroContexts.find(
        (pmc) => pmc.isVisible && rangeContains(pmc.nameOriginalRange, position)
    );
    if (pmc) {
        const ms = pmc.macroStatement;
        return getLocation(ms.uri, linkSupport, ms.nameOriginalRange, ms.originalRange);
    }
    if (implementation) {
        return null;
    }
    const ms = snapshot.macroStatements.find((ms) => ms.uri === uri && rangeContains(ms.originalRange, position));
    if (ms) {
        const mp = ms.parameters.find((mp) => mp.usages.some((mpu) => rangeContains(mpu.originalRange, position)));
        if (mp) {
            return getLocation(ms.uri, linkSupport, mp.originalRange, mp.originalRange);
        }
    }
    return null;
}

function getLocation(
    uri: DocumentUri,
    linkSupport: boolean,
    nameRange: Range,
    range: Range
): LocationLink[] | Location {
    if (linkSupport) {
        const result: LocationLink = {
            targetRange: range,
            targetSelectionRange: nameRange,
            targetUri: uri,
        };
        return [result];
    } else {
        const result: Location = {
            range: range,
            uri,
        };
        return result;
    }
}
