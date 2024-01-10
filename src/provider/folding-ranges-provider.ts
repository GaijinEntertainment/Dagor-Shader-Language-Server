import {
    FoldingRange,
    FoldingRangeKind,
    FoldingRangeParams,
} from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getConfiguration } from '../core/configuration-manager';
import { getSnapshot } from '../core/document-manager';

export async function foldingRangesProvider(
    params: FoldingRangeParams
): Promise<FoldingRange[] | undefined | null> {
    if (!getConfiguration().folding) {
        return null;
    }
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const result: FoldingRange[] = [];
    for (const ms of snapshot.macroStatements.filter(
        (ms) => ms.uri === params.textDocument.uri
    )) {
        result.push({
            startLine: ms.originalRange.start.line,
            endLine: ms.originalRange.end.line,
            kind: getCapabilities().foldingRangeKinds.includes(
                FoldingRangeKind.Region
            )
                ? FoldingRangeKind.Region
                : undefined,
        });
    }
    return result;
}
