import {
    Declaration,
    DeclarationLink,
    DeclarationParams,
} from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { linkProviderBase } from './link-provider-base';

export async function declarationProvider(
    params: DeclarationParams
): Promise<Declaration | DeclarationLink[] | undefined | null> {
    return await linkProviderBase(
        params.position,
        params.textDocument.uri,
        getCapabilities().declarationLink
    );
}
