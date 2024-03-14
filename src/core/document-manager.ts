import { DocumentUri } from 'vscode-languageserver';

import { getDocuments } from '../helper/server-helper';
import { DocumentInfo } from './document-info';
import { Snapshot } from './snapshot';

const documentInfos = new Map<DocumentUri, DocumentInfo>();

export async function getSnapshot(uri: DocumentUri): Promise<Snapshot | null> {
    let di = documentInfos.get(uri);
    if (!di) {
        const td = getDocuments().get(uri);
        if (!td) {
            return null;
        }
        di = new DocumentInfo(td);
        documentInfos.set(uri, di);
    }
    return await di.getSnapshot();
}

export function getDocumentInfo(uri: DocumentUri): DocumentInfo | null {
    return documentInfos.get(uri) ?? null;
}
