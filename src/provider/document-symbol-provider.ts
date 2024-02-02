import { DocumentSymbol, DocumentSymbolParams, SymbolInformation, SymbolKind } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { toStringDefineStatementHeader, toStringDefineStatementParameterList } from '../interface/define-statement';
import {
    toStringMacroDeclarationHeader,
    toStringMacroDeclarationParameterList,
} from '../interface/macro/macro-declaration';

export async function documentSymbolProvider(
    params: DocumentSymbolParams
): Promise<SymbolInformation[] | DocumentSymbol[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const mds = snapshot.macroDeclarations.filter((md) => md.uri === params.textDocument.uri);
    const dss = snapshot.defineStatements.filter((ds) => ds.isVisible);
    if (getCapabilities().documentSymbolHierarchy) {
        const result: DocumentSymbol[] = [];
        for (const md of mds) {
            result.push({
                name: md.name,
                kind: SymbolKind.Constant,
                range: md.originalRange,
                selectionRange: md.nameOriginalRange,
                detail: toStringMacroDeclarationParameterList(md),
            });
        }
        for (const ds of dss) {
            result.push({
                name: ds.name,
                kind: SymbolKind.Constant,
                range: ds.originalRange,
                selectionRange: ds.nameOriginalRange,
                detail: toStringDefineStatementParameterList(ds),
            });
        }
        return result;
    } else {
        const result: SymbolInformation[] = [];
        for (const md of mds) {
            const macroHeader = toStringMacroDeclarationHeader(md);
            result.push({
                name: macroHeader,
                kind: SymbolKind.Constant,
                containerName: macroHeader,
                location: {
                    range: md.nameOriginalRange,
                    uri: md.uri,
                },
            });
        }
        for (const ds of dss) {
            const defineHeader = toStringDefineStatementHeader(ds);
            result.push({
                name: defineHeader,
                kind: SymbolKind.Constant,
                containerName: defineHeader,
                location: {
                    range: ds.nameOriginalRange,
                    uri: params.textDocument.uri,
                },
            });
        }
        return result;
    }
}
