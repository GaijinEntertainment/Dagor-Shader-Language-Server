import { CancellationToken, DocumentLink } from 'vscode-languageserver';

import { getDocumentLinkErrorMessage } from '../helper/file-helper';
import { showWarningMessage } from '../helper/server-helper';
import { IncludeStatement } from '../interface/include/include-statement';
import { getIncludedDocumentUri } from '../processor/include-resolver';

export async function documentLinkResolveProvider(
    unresolvedLink: DocumentLink,
    token: CancellationToken
): Promise<DocumentLink | null> {
    const is: IncludeStatement = unresolvedLink.data;
    const uri = await getIncludedDocumentUri(is);
    if (uri) {
        return {
            range: unresolvedLink.range,
            target: uri,
        };
    } else {
        showWarningMessage(getDocumentLinkErrorMessage());
        return null;
    }
}
