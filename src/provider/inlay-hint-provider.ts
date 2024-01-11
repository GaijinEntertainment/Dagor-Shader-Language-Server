import {
    InlayHint,
    InlayHintKind,
    InlayHintParams,
} from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';

export async function inlayHintProvider(
    params: InlayHintParams
): Promise<InlayHint[] | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const result: InlayHint[] = [];
    for (const mc of snapshot.macroContexts.filter((mc) => !mc.isNotVisible)) {
        for (let i = 0; i < mc.arguments.length; i++) {
            const ma = mc.arguments[i];
            const mp = mc.macroStatement.parameters[i];
            result.push({
                label: `${mp}:`,
                position: ma.trimmedOriginalStartPosition,
                kind: InlayHintKind.Parameter,
                paddingRight: true,
            });
        }
    }
    return result;
}
