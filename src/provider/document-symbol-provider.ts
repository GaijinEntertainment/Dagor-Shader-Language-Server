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
import { toStringBlockType } from '../interface/block/block-declaration';
import {
    DefineStatement,
    toStringDefineStatementHeader,
    toStringDefineStatementParameterList,
} from '../interface/define-statement';
import {
    toStringMacroDeclarationHeader,
    toStringMacroDeclarationParameterList,
} from '../interface/macro/macro-declaration';
import { getVariableTypeWithInterval } from '../interface/variable/variable-declaration';

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
    const dss = snapshot.defineStatements.filter((ds) => ds.isVisible && !ds.realDefine);
    for (const ds of dss) {
        result.push(defineToDocumentSymbol(ds));
    }
    addScopedElements(result, snapshot.rootScope, uri);
    return result;
}

function addScopedElements(dss: DocumentSymbol[], scope: Scope, uri: DocumentUri): void {
    for (const td of scope.typeDeclarations) {
        if (td.isVisible) {
            dss.push({
                name: td.name,
                kind: SymbolKind.Struct,
                range: td.originalRange,
                selectionRange: td.nameOriginalRange,
                detail: 'struct',
                children: td.members.map((m) => ({
                    name: m.name,
                    kind: SymbolKind.Field,
                    range: m.originalRange,
                    selectionRange: m.nameOriginalRange,
                    detail: m.type,
                })),
            });
        }
    }
    for (const vd of scope.variableDeclarations) {
        if (vd.isVisible) {
            dss.push({
                name: vd.name,
                kind: SymbolKind.Variable,
                range: vd.originalRange,
                selectionRange: vd.nameOriginalRange,
                detail: getVariableTypeWithInterval(vd),
            });
        }
    }
    for (const childScope of scope.children) {
        if (childScope.shaderDeclarations.length && childScope.shaderDeclarations[0].isVisible) {
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
                addScopedElements(sdss, shaderChildScope, uri);
            }
        } else if (childScope.blockDeclaration) {
            if (childScope.blockDeclaration.isVisible) {
                const sdss: DocumentSymbol[] = [];
                dss.push({
                    name: childScope.blockDeclaration.name,
                    kind: SymbolKind.Module,
                    range: childScope.blockDeclaration.originalRange,
                    selectionRange: childScope.blockDeclaration.originalRange,
                    detail: toStringBlockType(childScope.blockDeclaration),
                    children: sdss,
                });
                for (const shaderChildScope of childScope.children) {
                    addScopedElements(sdss, shaderChildScope, uri);
                }
            }
        } else if (childScope.macroDeclaration) {
            if (childScope.macroDeclaration.uri === uri) {
                const sdss = childScope.macroDeclaration.contentSnapshot.defineStatements.map((ds) =>
                    defineToDocumentSymbol(ds)
                );
                dss.push({
                    name: childScope.macroDeclaration.name,
                    kind: SymbolKind.Constant,
                    range: childScope.macroDeclaration.originalRange,
                    selectionRange: childScope.macroDeclaration.nameOriginalRange,
                    detail: toStringMacroDeclarationParameterList(childScope.macroDeclaration),
                    children: sdss,
                });
                for (const shaderChildScope of childScope.children) {
                    addScopedElements(sdss, shaderChildScope, uri);
                }
            }
        } else {
            addScopedElements(dss, childScope, uri);
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
    const tds = snapshot.getAllTypeDeclarations();
    for (const td of tds) {
        result.push({
            name: td.name,
            kind: SymbolKind.Struct,
            containerName: td.name,
            location: {
                range: td.originalRange,
                uri: td.uri,
            },
        });
    }
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
