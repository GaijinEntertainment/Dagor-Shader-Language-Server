import {
    DocumentUri,
    Location,
    LocationLink,
    Position,
} from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';

export async function linkProviderBase(
    position: Position,
    uri: DocumentUri,
    linkSupport: boolean
): Promise<LocationLink[] | Location | null> {
    const snapshot = await getSnapshot(uri);
    if (!snapshot) {
        return null;
    }
    const mc = snapshot.macroContexts
        .filter((mc) => !mc.isNotVisible)
        .find((mc) => rangeContains(mc.nameOriginalRange, position));
    if (!mc) {
        return null;
    }
    const ms = mc.macroStatement;
    if (linkSupport) {
        const result: LocationLink = {
            targetRange: ms.originalRange,
            targetSelectionRange: ms.nameOriginalRange,
            targetUri: ms.uri,
        };
        return [result];
    } else {
        const result: Location = {
            range: ms.nameOriginalRange,
            uri: ms.uri,
        };
        return result;
    }
}
