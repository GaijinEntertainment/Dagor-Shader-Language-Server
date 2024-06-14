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
import { getKind, getTypeSymbolKind } from '../helper/helper';
import { Scope } from '../helper/scope';
import { toStringBlockType } from '../interface/block/block-declaration';
import {
    DefineStatement,
    toStringDefineStatementHeader,
    toStringDefineStatementParameterList,
} from '../interface/define-statement';
import { toStringMacroDeclarationParameterList } from '../interface/macro/macro-declaration';
import { EnumDeclaration } from '../interface/type/enum-declaration';
import { TypeDeclaration } from '../interface/type/type-declaration';
import { VariableDeclaration, toStringVariableType } from '../interface/variable/variable-declaration';

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
    addHierarchicalElements(result, snapshot.rootScope, uri);
    return result;
}

function addHierarchicalElements(dss: DocumentSymbol[], scope: Scope, uri: DocumentUri): void {
    addHierarchicalTypes(scope.typeDeclarations, dss);
    addHierarchicalEnums(scope.enumDeclarations, dss);
    addHierarchicalVariables(scope.variableDeclarations, dss);
    for (const childScope of scope.children) {
        if (childScope.shaderDeclarations.length && childScope.shaderDeclarations[0].isVisible) {
            const sdss: DocumentSymbol[] = [];
            dss.push({
                name: childScope.shaderDeclarations.map((sd) => sd.name).join(', '),
                kind: getKind(SymbolKind.Module),
                range: childScope.shaderDeclarations[0].originalRange,
                selectionRange: childScope.shaderDeclarations[0].originalRange,
                detail: 'shader',
                children: sdss,
            });
            for (const shaderChildScope of childScope.children) {
                addHierarchicalElements(sdss, shaderChildScope, uri);
            }
        } else if (childScope.blockDeclaration) {
            if (childScope.blockDeclaration.isVisible) {
                const sdss: DocumentSymbol[] = [];
                dss.push({
                    name: childScope.blockDeclaration.name,
                    kind: getKind(SymbolKind.Module),
                    range: childScope.blockDeclaration.originalRange,
                    selectionRange: childScope.blockDeclaration.originalRange,
                    detail: toStringBlockType(childScope.blockDeclaration),
                    children: sdss,
                });
                for (const shaderChildScope of childScope.children) {
                    addHierarchicalElements(sdss, shaderChildScope, uri);
                }
            }
        } else if (childScope.macroDeclaration) {
            if (childScope.macroDeclaration.uri === uri) {
                const sdss = childScope.macroDeclaration.contentSnapshot.defineStatements.map((ds) =>
                    defineToDocumentSymbol(ds)
                );
                dss.push({
                    name: childScope.macroDeclaration.name,
                    kind: getKind(SymbolKind.Constant),
                    range: childScope.macroDeclaration.originalRange,
                    selectionRange: childScope.macroDeclaration.nameOriginalRange,
                    detail: toStringMacroDeclarationParameterList(childScope.macroDeclaration),
                    children: sdss,
                });
                for (const shaderChildScope of childScope.children) {
                    addHierarchicalElements(sdss, shaderChildScope, uri);
                }
            }
        } else if (childScope.functionDeclaration) {
            const fd = childScope.functionDeclaration;
            if (fd.isVisible) {
                const sdss: DocumentSymbol[] = [];
                dss.push({
                    name: fd.name,
                    kind: getKind(SymbolKind.Function),
                    range: fd.originalRange,
                    selectionRange: fd.nameOriginalRange,
                    detail: fd.type,
                    children: sdss,
                });
                addHierarchicalVariables(childScope.variableDeclarations, sdss);
                for (const shaderChildScope of childScope.children) {
                    addHierarchicalElements(sdss, shaderChildScope, uri);
                }
            }
        } else {
            addHierarchicalElements(dss, childScope, uri);
        }
    }
}

function addHierarchicalEnums(eds: EnumDeclaration[], dss: DocumentSymbol[]): void {
    for (const ed of eds) {
        if (ed.isVisible) {
            dss.push({
                name: ed.name ?? '<anonymous>',
                kind: getKind(SymbolKind.Enum),
                range: ed.originalRange,
                selectionRange: ed.nameOriginalRange ?? ed.originalRange,
                detail: 'enum' + (ed.isClass ? ' class' : '') + (ed.type ? ` (${ed.type})` : ''),
                children: ed.members.map((m) => ({
                    name: m.name,
                    kind: getKind(SymbolKind.EnumMember),
                    range: m.originalRange,
                    selectionRange: m.originalRange,
                })),
            });
        }
    }
}

function addHierarchicalTypes(tds: TypeDeclaration[], dss: DocumentSymbol[]): void {
    for (const td of tds) {
        if (td.isVisible) {
            const children: DocumentSymbol[] = td.members.map((m) => ({
                name: m.name,
                kind: getKind(SymbolKind.Field),
                range: m.originalRange,
                selectionRange: m.nameOriginalRange,
                detail: m.type,
            }));
            addHierarchicalTypes(td.embeddedTypes, children);
            addHierarchicalEnums(td.embeddedEnums, children);
            dss.push({
                name: td.name ?? '<anonymous>',
                kind: getTypeSymbolKind(td.type),
                range: td.originalRange,
                selectionRange: td.nameOriginalRange,
                detail: td.type,
                children,
            });
        }
    }
}

function addHierarchicalVariables(vds: VariableDeclaration[], dss: DocumentSymbol[]): void {
    for (const vd of vds) {
        if (vd.isVisible) {
            dss.push({
                name: vd.name,
                kind: getKind(SymbolKind.Variable),
                range: vd.originalRange,
                selectionRange: vd.nameOriginalRange,
                detail: toStringVariableType(vd),
            });
        }
    }
}

function defineToDocumentSymbol(ds: DefineStatement): DocumentSymbol {
    return {
        name: ds.name,
        kind: getKind(SymbolKind.Constant),
        range: ds.originalRange,
        selectionRange: ds.nameOriginalRange,
        detail: toStringDefineStatementParameterList(ds),
    };
}

function createSymbolInformations(snapshot: Snapshot, uri: DocumentUri): SymbolInformation[] {
    const result: SymbolInformation[] = [];
    addScopedElements(result, snapshot.rootScope, uri, '');
    const dss = snapshot.defineStatements.filter((ds) => ds.isVisible && !ds.realDefine);
    addDefines(dss, result, uri, '');
    return result;
}

function addScopedElements(result: SymbolInformation[], scope: Scope, uri: DocumentUri, containerName: string): void {
    addTypes(scope.typeDeclarations, result, uri, containerName);
    addEnums(scope.enumDeclarations, result, uri, containerName);
    addVariables(scope.variableDeclarations, result, uri, containerName);
    for (const childScope of scope.children) {
        if (childScope.shaderDeclarations.length && childScope.shaderDeclarations[0].isVisible) {
            const name = childScope.shaderDeclarations.map((sd) => sd.name).join(', ');
            result.push({
                name,
                kind: getKind(SymbolKind.Module),
                location: {
                    range: childScope.shaderDeclarations[0].originalRange,
                    uri,
                },
                containerName,
            });
            for (const shaderChildScope of childScope.children) {
                addScopedElements(result, shaderChildScope, uri, name);
            }
        } else if (childScope.blockDeclaration) {
            if (childScope.blockDeclaration.isVisible) {
                result.push({
                    name: childScope.blockDeclaration.name,
                    kind: getKind(SymbolKind.Module),
                    location: {
                        range: childScope.blockDeclaration.originalRange,
                        uri,
                    },
                    containerName,
                });
                for (const shaderChildScope of childScope.children) {
                    addScopedElements(result, shaderChildScope, uri, childScope.blockDeclaration.name);
                }
            }
        } else if (childScope.macroDeclaration) {
            const md = childScope.macroDeclaration;
            if (md.uri === uri) {
                result.push({
                    name: md.name,
                    kind: getKind(SymbolKind.Constant),
                    location: {
                        range: md.originalRange,
                        uri,
                    },
                    containerName,
                });
                addDefines(md.contentSnapshot.defineStatements, result, uri, md.name);
                for (const shaderChildScope of childScope.children) {
                    addScopedElements(result, shaderChildScope, uri, md.name);
                }
            }
        } else if (childScope.functionDeclaration) {
            const fd = childScope.functionDeclaration;
            if (fd.isVisible) {
                result.push({
                    name: fd.name,
                    kind: getKind(SymbolKind.Function),
                    location: {
                        range: fd.originalRange,
                        uri,
                    },
                    containerName,
                });
                addVariables(childScope.variableDeclarations, result, uri, fd.name);
                for (const shaderChildScope of childScope.children) {
                    addScopedElements(result, shaderChildScope, uri, fd.name);
                }
            }
        } else {
            addScopedElements(result, childScope, uri, containerName);
        }
    }
}

function addEnums(eds: EnumDeclaration[], result: SymbolInformation[], uri: DocumentUri, containerName: string): void {
    for (const ed of eds) {
        if (ed.isVisible) {
            const name = ed.name ?? '<anonymous>';
            result.push({
                name,
                kind: getKind(SymbolKind.Enum),
                location: {
                    range: ed.originalRange,
                    uri,
                },
                containerName,
            });
            result.push(
                ...ed.members.map((m) => ({
                    name: m.name,
                    kind: getKind(SymbolKind.EnumMember),
                    location: {
                        range: m.originalRange,
                        uri,
                    },
                    containerName: name,
                }))
            );
        }
    }
}

function addTypes(tds: TypeDeclaration[], result: SymbolInformation[], uri: DocumentUri, containerName: string): void {
    for (const td of tds) {
        if (td.isVisible) {
            const name = td.name ?? '<anonymous>';
            result.push({
                name,
                kind: getTypeSymbolKind(td.type),
                location: {
                    range: td.originalRange,
                    uri,
                },
                containerName,
            });
            result.push(
                ...td.members.map((m) => ({
                    name: m.name,
                    kind: getKind(SymbolKind.Field),
                    location: {
                        range: m.originalRange,
                        uri,
                    },
                    containerName: name,
                }))
            );
            addTypes(td.embeddedTypes, result, uri, name);
            addEnums(td.embeddedEnums, result, uri, name);
        }
    }
}

function addVariables(
    vds: VariableDeclaration[],
    result: SymbolInformation[],
    uri: DocumentUri,
    containerName: string
): void {
    for (const vd of vds) {
        if (vd.isVisible) {
            result.push({
                name: vd.name,
                kind: getKind(SymbolKind.Variable),
                location: {
                    range: vd.originalRange,
                    uri,
                },
                containerName,
            });
        }
    }
}

function addDefines(
    dss: DefineStatement[],
    result: SymbolInformation[],
    uri: DocumentUri,
    containerName: string
): void {
    for (const ds of dss) {
        const defineHeader = toStringDefineStatementHeader(ds);
        result.push({
            name: defineHeader,
            kind: getKind(SymbolKind.Constant),
            location: {
                range: ds.originalRange,
                uri,
            },
            containerName,
        });
    }
}
