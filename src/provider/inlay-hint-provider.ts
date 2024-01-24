import { InlayHint, InlayHintKind, InlayHintParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { getBestMacroDeclaration } from '../interface/macro/macro-usage';

export async function inlayHintProvider(params: InlayHintParams): Promise<InlayHint[] | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const mus = snapshot.macroUsages.filter(
        (mu) =>
            mu.isVisible &&
            (rangeContains(params.range, mu.nameOriginalRange.start) ||
                rangeContains(params.range, mu.nameOriginalRange.end))
    );
    const result: InlayHint[] = [];
    for (const mu of mus) {
        const md = getBestMacroDeclaration(mu);
        if (md) {
            for (let i = 0; i < mu.arguments.length && i < md.parameters.length; i++) {
                const ma = mu.arguments[i];
                const mp = md.parameters[i];
                result.push({
                    label: [
                        {
                            value: `${mp.name}:`,
                            location: {
                                range: mp.originalRange,
                                uri: md.uri,
                            },
                        },
                    ],
                    position: ma.trimmedOriginalStartPosition,
                    kind: InlayHintKind.Parameter,
                    paddingRight: true,
                });
            }
        }
    }
    return result;
}
