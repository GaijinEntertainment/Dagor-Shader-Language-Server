import { DocumentLink, DocumentLinkParams } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { getCapabilities } from '../core/capability-manager';
import { showDocumentLinkDebugLabel } from '../core/debug';
import { getSnapshot } from '../core/document-manager';
import { positionsEqual } from '../helper/helper';
import { PerformanceHelper } from '../helper/performance-helper';
import { IncludeStatement } from '../interface/include/include-statement';
import { getIncludedDocumentUri } from '../processor/include-resolver';

export async function documentLinksProvider(dlp: DocumentLinkParams): Promise<DocumentLink[]> {
    const snapshot = await getSnapshot(dlp.textDocument.uri);
    if (!snapshot) {
        return [];
    }
    const ph = new PerformanceHelper(dlp.textDocument.uri);
    ph.start('documentLinksProvider');
    const links: DocumentLink[] = [];
    for (const is of snapshot.includeStatements) {
        if (!positionsEqual(is.pathOriginalRange.start, is.pathOriginalRange.end)) {
            const link = await createLink(is);
            links.push(link);
        }
    }
    ph.end('documentLinksProvider');
    ph.log('providing document links', 'documentLinksProvider');
    return links;
}

async function createLink(is: IncludeStatement): Promise<DocumentLink> {
    const tooltip = await getDebugTooltip(is);
    return { range: is.pathOriginalRange, data: is, tooltip };
}

async function getDebugTooltip(is: IncludeStatement): Promise<string | undefined> {
    if (!showDocumentLinkDebugLabel || !getCapabilities().documentLinkTooltip) {
        return undefined;
    }
    const uri = await getIncludedDocumentUri(is);
    const niceUri = uri ? URI.parse(uri).fsPath : "Couldn't find the file.";
    return `${niceUri} (${is.type})`;
}
