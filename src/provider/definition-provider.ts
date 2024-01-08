import {
    Definition,
    DefinitionLink,
    DefinitionParams,
    LocationLink,
} from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';

export async function definitionProvider(
    params: DefinitionParams
): Promise<Definition | DefinitionLink[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const mc = snapshot.macroContexts
        .filter((mc) => !mc.isNotVisible)
        .find((mc) => rangeContains(mc.originalNameRange, params.position));
    if (mc) {
        const ms = mc.macro;
        if (getCapabilities().definitionLink) {
            const result: LocationLink = {
                targetRange: ms.originalRange,
                targetSelectionRange: ms.nameOriginalRange,
                targetUri: ms.uri,
            };
            return [result];
        } else {
            const result: Definition = {
                range: ms.nameOriginalRange,
                uri: ms.uri,
            };
            return result;
        }
    }
    return null;
}
