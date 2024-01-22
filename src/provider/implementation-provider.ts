import { Definition, DefinitionLink, ImplementationParams } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { linkProviderBase } from './link-provider-base';

export async function implementationProvider(
    params: ImplementationParams
): Promise<Definition | DefinitionLink[] | undefined | null> {
    return await linkProviderBase(params.position, params.textDocument.uri, getCapabilities().implementationLink, true);
}
