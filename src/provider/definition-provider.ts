import {
    Definition,
    DefinitionLink,
    DefinitionParams,
    LocationLink,
} from 'vscode-languageserver';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';

export async function definitionProvider(
    params: DefinitionParams
): Promise<Definition | DefinitionLink[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const mc = snapshot.macroContexts.find((mc) =>
        rangeContains(mc.originalRange, params.position)
    );
    if (mc) {
        const ms = mc.macro;
        const result: LocationLink = {
            targetRange: ms.originalRange,
            targetSelectionRange: ms.nameOriginalRange,
            targetUri: ms.uri,
        };
        return [result];
    }
    return null;
}
