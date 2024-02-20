import { FoldingRange, FoldingRangeKind, FoldingRangeParams } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';

export async function foldingRangesProvider(params: FoldingRangeParams): Promise<FoldingRange[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const result: FoldingRange[] = [];
    for (const md of snapshot.macroDeclarations.filter((md) => md.uri === params.textDocument.uri)) {
        result.push({
            startLine: md.originalRange.start.line,
            endLine: md.originalRange.end.line,
            kind: getCapabilities().foldingRangeKinds.includes(FoldingRangeKind.Region)
                ? FoldingRangeKind.Region
                : undefined,
        });
    }
    for (const ir of snapshot.ifRanges) {
        result.push({
            startLine: ir.start.line,
            endLine: ir.end.line - 1,
            kind: getCapabilities().foldingRangeKinds.includes(FoldingRangeKind.Region)
                ? FoldingRangeKind.Region
                : undefined,
        });
    }
    for (const ir of snapshot.foldingRanges) {
        result.push({
            startLine: ir.start.line,
            endLine: ir.end.line - 1,
            kind: getCapabilities().foldingRangeKinds.includes(FoldingRangeKind.Region)
                ? FoldingRangeKind.Region
                : undefined,
        });
    }
    return result;
}
