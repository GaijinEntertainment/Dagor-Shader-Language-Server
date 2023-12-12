import {
    Connection,
    InitializeParams,
    InitializeResult,
    InitializedParams,
    ProposedFeatures,
    TextDocumentSyncKind,
    createConnection,
} from 'vscode-languageserver/node';

import { getConfiguration } from './core/configuration-manager';
import { SERVER_NAME, SERVER_VERSION } from './core/constant';
import { clearCache } from './core/file-cache-manager';
import { Configuration } from './interface/configuration';
import {
    collectIncludeFolders,
    collectOverrideIncludeFolders,
} from './processor/include-processor';
import { definitionProvider } from './provider/definition-provider';
import { documentLinkResolveProvider } from './provider/document-link-resolve-provider';
import { documentLinksProvider } from './provider/document-links-provider';
import { Server } from './server';

export class ServerDesktop extends Server {
    protected override createConnection(): Connection {
        return createConnection(ProposedFeatures.all);
    }

    protected override addFeatures(): void {
        super.addFeatures();
        this.connection.onDocumentLinks(documentLinksProvider);
        this.connection.onDocumentLinkResolve(documentLinkResolveProvider);
        this.connection.onDefinition(definitionProvider);
    }

    protected override onInitialize(ip: InitializeParams): InitializeResult {
        return {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Incremental,
                definitionProvider: true,
                // completionProvider: {},
                documentLinkProvider: { resolveProvider: true },
            },
            serverInfo: {
                name: SERVER_NAME,
                version: SERVER_VERSION,
            },
        };
    }

    protected override async onInitialized(
        _ip: InitializedParams
    ): Promise<void> {
        await this.collectShaderIncludeFolders(
            getConfiguration().shaderConfigOverride
        );
    }

    protected override onShutdown(): void {
        clearCache();
    }

    public override async configurationChanged(
        oldConfiguration: Configuration,
        newConfiguration: Configuration
    ): Promise<void> {
        if (
            oldConfiguration.shaderConfigOverride !==
            newConfiguration.shaderConfigOverride
        ) {
            await this.collectShaderIncludeFolders(
                newConfiguration.shaderConfigOverride
            );
        }
    }

    private async collectShaderIncludeFolders(
        shaderConfigOverride: string
    ): Promise<void> {
        if (shaderConfigOverride) {
            await collectOverrideIncludeFolders();
        } else {
            await collectIncludeFolders();
        }
    }
}

new ServerDesktop();
