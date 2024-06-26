import { Definition, DefinitionLink, TypeDefinitionParams } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { linkProviderBase } from './link-provider-base';

export async function typeDefinitionProvider(
    params: TypeDefinitionParams
): Promise<Definition | DefinitionLink[] | undefined | null> {
    return await linkProviderBase(
        params.position,
        params.textDocument.uri,
        getCapabilities().definitionLink,
        'typeDefinition'
    );
}
