import { DocumentSymbol, DocumentSymbolParams, SymbolInformation, SymbolKind } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import {
    MacroStatement,
    toStringMacroStatementHeader,
    toStringMacroStatementParameterList,
} from '../interface/macro/macro-statement';

export async function documentSymbolProvider(
    params: DocumentSymbolParams
): Promise<SymbolInformation[] | DocumentSymbol[] | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const mss = snapshot.macroStatements.filter((ms) => ms.uri === params.textDocument.uri);
    if (getCapabilities().documentSymbolHierarchy) {
        const result: DocumentSymbol[] = [];
        for (const ms of mss) {
            const ds = getDocumentSymbol(ms);
            result.push(ds);
        }
        return result;
    } else {
        const result: SymbolInformation[] = [];
        for (const ms of mss) {
            const si = getSymbolInformation(ms);
            result.push(si);
        }
        return result;
    }
}

function getDocumentSymbol(ms: MacroStatement): DocumentSymbol {
    return {
        name: ms.name,
        kind: SymbolKind.Constant,
        range: ms.originalRange,
        selectionRange: ms.nameOriginalRange,
        detail: toStringMacroStatementParameterList(ms),
    };
}

function getSymbolInformation(ms: MacroStatement): SymbolInformation {
    const macroHeader = toStringMacroStatementHeader(ms);
    return {
        name: macroHeader,
        kind: SymbolKind.Constant,
        containerName: macroHeader,
        location: {
            range: ms.nameOriginalRange,
            uri: ms.uri,
        },
    };
}
