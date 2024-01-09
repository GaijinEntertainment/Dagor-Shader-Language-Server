import {
    Connection,
    InitializeParams,
    InitializeResult,
    InitializedParams,
    InlayHintRequest,
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
import { completionProvider } from './provider/completion-provider';
import { declarationProvider } from './provider/declaration-provider';
import { definitionProvider } from './provider/definition-provider';
import { documentHighlightProvider } from './provider/document-highlight-provider';
import { documentLinkResolveProvider } from './provider/document-link-resolve-provider';
import { documentLinksProvider } from './provider/document-links-provider';
import { documentSymbolProvider } from './provider/document-symbol-provider';
import { foldingRangesProvider } from './provider/folding-ranges-provider';
import { hoverProvider } from './provider/hover-provider';
import { implementationProvider } from './provider/implementation-provider';
import { inlayHintProvider } from './provider/inlay-hint-provider';
import { Server } from './server';

export class ServerDesktop extends Server {
    protected override createConnection(): Connection {
        return createConnection(ProposedFeatures.all);
    }

    protected override addFeatures(): void {
        super.addFeatures();
        this.connection.onCompletion(completionProvider);
        this.connection.onDeclaration(declarationProvider);
        this.connection.onDefinition(definitionProvider);
        this.connection.onDocumentHighlight(documentHighlightProvider);
        this.connection.onDocumentLinks(documentLinksProvider);
        this.connection.onDocumentLinkResolve(documentLinkResolveProvider);
        this.connection.onDocumentSymbol(documentSymbolProvider);
        this.connection.onFoldingRanges(foldingRangesProvider);
        this.connection.onHover(hoverProvider);
        this.connection.onImplementation(implementationProvider);
        this.connection.onRequest(InlayHintRequest.type, inlayHintProvider);
    }

    protected override onInitialize(ip: InitializeParams): InitializeResult {
        return {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Incremental,
                completionProvider: {},
                declarationProvider: true,
                definitionProvider: true,
                documentHighlightProvider: true,
                documentLinkProvider: { resolveProvider: true },
                documentSymbolProvider: true,
                foldingRangeProvider: true,
                hoverProvider: true,
                implementationProvider: true,
                inlayHintProvider: { documentSelector: [{ language: 'dshl' }] },
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
