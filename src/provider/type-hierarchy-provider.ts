import {
    Position,
    TypeHierarchyItem,
    TypeHierarchyPrepareParams,
    TypeHierarchySubtypesParams,
    TypeHierarchySupertypesParams,
} from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { getTypeSymbolKind } from '../helper/helper';
import { TypeDeclaration } from '../interface/type/type-declaration';

export async function typeHierarchyPrepareProvider(
    params: TypeHierarchyPrepareParams
): Promise<TypeHierarchyItem[] | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const td = snapshot.getTypeDeclarationAt(params.position);
    if (td) {
        return [mapTypeDeclaration(td)];
    }
    const tu = snapshot.getTypeUsageAt(params.position);
    if (tu) {
        return [mapTypeDeclaration(tu.declaration)];
    }
    return null;
}

export async function typeHierarchySupertypesProvider(
    params: TypeHierarchySupertypesParams
): Promise<TypeHierarchyItem[] | null> {
    const td = await getTypeDeclaration(params.item);
    if (td) {
        return td.superTypes.map((td) => mapTypeDeclaration(td));
    } else {
        return null;
    }
}

export async function typeHierarchySubtypesProvider(
    params: TypeHierarchySubtypesParams
): Promise<TypeHierarchyItem[] | null> {
    const td = await getTypeDeclaration(params.item);
    if (td) {
        return td.subTypes.map((td) => mapTypeDeclaration(td));
    } else {
        return null;
    }
}

async function getTypeDeclaration(item: TypeHierarchyItem): Promise<TypeDeclaration | null> {
    const snapshot = await getSnapshot(item.uri);
    if (!snapshot) {
        return null;
    }
    const position = item.data as Position;
    const td = snapshot.getTypeDeclarationAt(position);
    if (td) {
        return td;
    }
    const tu = snapshot.getTypeUsageAt(position);
    if (tu) {
        return tu.declaration;
    }
    return null;
}

function mapTypeDeclaration(td: TypeDeclaration): TypeHierarchyItem {
    return {
        kind: getTypeSymbolKind(td.type),
        name: td.name ?? '<anonymous>',
        range: td.originalRange,
        selectionRange: td.nameOriginalRange,
        uri: td.uri,
        data: td.nameOriginalRange.start,
    };
}
