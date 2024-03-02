import {
    DocumentSymbol,
    DocumentSymbolParams,
    DocumentUri,
    SymbolInformation,
    SymbolKind,
} from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { Snapshot } from '../core/snapshot';
import { Scope } from '../helper/scope';
import {
    DefineStatement,
    toStringDefineStatementHeader,
    toStringDefineStatementParameterList,
} from '../interface/define-statement';
import {
    toStringMacroDeclarationHeader,
    toStringMacroDeclarationParameterList,
} from '../interface/macro/macro-declaration';

export async function documentSymbolProvider(
    params: DocumentSymbolParams
): Promise<SymbolInformation[] | DocumentSymbol[] | undefined | null> {
    const uri = params.textDocument.uri;
    const snapshot = await getSnapshot(uri);
    if (!snapshot) {
        return null;
    }
    if (getCapabilities().documentSymbolHierarchy) {
        return createDocumentSymbols(snapshot, uri);
    } else {
        return createSymbolInformations(snapshot, uri);
    }
}

function createDocumentSymbols(snapshot: Snapshot, uri: DocumentUri): DocumentSymbol[] {
    const result: DocumentSymbol[] = [];
    const mds = snapshot.macroDeclarations.filter((md) => md.uri === uri);
    for (const md of mds) {
        result.push({
            name: md.name,
            kind: SymbolKind.Constant,
            range: md.originalRange,
            selectionRange: md.nameOriginalRange,
            detail: toStringMacroDeclarationParameterList(md),
            children: md.contentSnapshot.defineStatements.map((ds) => defineToDocumentSymbol(ds)),
        });
    }
    const dss = snapshot.defineStatements.filter((ds) => ds.isVisible && !ds.realDefine);
    for (const ds of dss) {
        result.push(defineToDocumentSymbol(ds));
    }
    addScopedElements(result, snapshot.rootScope);
    return result;
}

function addScopedElements(dss: DocumentSymbol[], scope: Scope): void {
    for (const vd of scope.variableDeclarations) {
        dss.push({
            name: vd.name,
            kind: SymbolKind.Variable,
            range: vd.originalRange,
            selectionRange: vd.nameOriginalRange,
            detail: vd.type,
        });
    }
    for (const childScope of scope.children) {
        if (childScope.shaderDeclarations.length) {
            const sdss: DocumentSymbol[] = [];
            dss.push({
                name: childScope.shaderDeclarations.map((sd) => sd.name).join(', '),
                kind: SymbolKind.Module,
                range: childScope.shaderDeclarations[0].originalRange,
                selectionRange: childScope.shaderDeclarations[0].originalRange,
                detail: 'shader',
                children: sdss,
            });
            for (const shaderChildScope of childScope.children) {
                addScopedElements(sdss, shaderChildScope);
            }
        } else {
            addScopedElements(dss, childScope);
        }
    }
}

function defineToDocumentSymbol(ds: DefineStatement): DocumentSymbol {
    return {
        name: ds.name,
        kind: SymbolKind.Constant,
        range: ds.originalRange,
        selectionRange: ds.nameOriginalRange,
        detail: toStringDefineStatementParameterList(ds),
    };
}

function createSymbolInformations(snapshot: Snapshot, uri: DocumentUri): SymbolInformation[] {
    const result: SymbolInformation[] = [];
    const mds = snapshot.macroDeclarations.filter((md) => md.uri === uri);
    for (const md of mds) {
        const macroHeader = toStringMacroDeclarationHeader(md);
        result.push({
            name: macroHeader,
            kind: SymbolKind.Constant,
            containerName: macroHeader,
            location: {
                range: md.originalRange,
                uri: md.uri,
            },
        });
        addDefines(result, md.contentSnapshot.defineStatements, uri);
    }
    const dss = snapshot.defineStatements.filter((ds) => ds.isVisible);
    addDefines(result, dss, uri);
    const vds = snapshot.getAllVariableDeclarations();
    for (const vd of vds) {
        result.push({
            name: vd.name,
            kind: SymbolKind.Variable,
            containerName: vd.name,
            location: {
                range: vd.originalRange,
                uri: vd.uri,
            },
        });
    }
    for (const scope of snapshot.rootScope.children) {
        if (scope.shaderDeclarations.length) {
            const name = scope.shaderDeclarations.map((sd) => sd.name).join(', ');
            result.push({
                name,
                kind: SymbolKind.Module,
                containerName: name,
                location: {
                    uri: scope.shaderDeclarations[0].uri,
                    range: scope.shaderDeclarations[0].originalRange,
                },
            });
        }
    }
    return result;
}

function addDefines(result: SymbolInformation[], dss: DefineStatement[], uri: DocumentUri): void {
    for (const ds of dss) {
        const defineHeader = toStringDefineStatementHeader(ds);
        result.push({
            name: defineHeader,
            kind: SymbolKind.Constant,
            containerName: defineHeader,
            location: {
                range: ds.originalRange,
                uri,
            },
        });
    }
}
