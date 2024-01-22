import { InlayHint, InlayHintKind, InlayHintParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';

export async function inlayHintProvider(params: InlayHintParams): Promise<InlayHint[] | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const pmcs = snapshot.potentialMacroContexts.filter(
        (pmc) =>
            pmc.isVisible &&
            (rangeContains(params.range, pmc.nameOriginalRange.start) ||
                rangeContains(params.range, pmc.nameOriginalRange.end))
    );
    const result: InlayHint[] = [];
    for (const pmc of pmcs) {
        for (let i = 0; i < pmc.arguments.length && i < pmc.macroStatement.parameters.length; i++) {
            const ma = pmc.arguments[i];
            const mp = pmc.macroStatement.parameters[i];
            result.push({
                label: `${mp.name}:`,
                position: ma.trimmedOriginalStartPosition,
                kind: InlayHintKind.Parameter,
                paddingRight: true,
            });
        }
    }
    return result;
}
