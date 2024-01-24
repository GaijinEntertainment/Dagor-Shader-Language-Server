import { DocumentSymbol, DocumentSymbolParams, SymbolInformation, SymbolKind } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import {
    MacroDeclaration,
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
    if (getCapabilities().documentSymbolHierarchy) {
        const result: DocumentSymbol[] = [];
        for (const md of mds) {
            const ds = getDocumentSymbol(md);
            result.push(ds);
        }
        return result;
    } else {
        const result: SymbolInformation[] = [];
        for (const md of mds) {
            const si = getSymbolInformation(md);
            result.push(si);
        }
        return result;
    }
}

function getDocumentSymbol(md: MacroDeclaration): DocumentSymbol {
    return {
        name: md.name,
        kind: SymbolKind.Constant,
        range: md.originalRange,
        selectionRange: md.nameOriginalRange,
        detail: toStringMacroDeclarationParameterList(md),
    };
}

function getSymbolInformation(md: MacroDeclaration): SymbolInformation {
    const macroHeader = toStringMacroDeclarationHeader(md);
    return {
        name: macroHeader,
        kind: SymbolKind.Constant,
        containerName: macroHeader,
        location: {
            range: md.nameOriginalRange,
            uri: md.uri,
        },
    };
}
