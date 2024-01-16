import { Definition, DefinitionLink, DefinitionParams } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { linkProviderBase } from './link-provider-base';

export async function definitionProvider(
    params: DefinitionParams
): Promise<Definition | DefinitionLink[] | undefined | null> {
    return await linkProviderBase(params.position, params.textDocument.uri, getCapabilities().definitionLink);
}
