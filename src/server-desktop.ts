import {
    Connection,
    InitializeParams,
    InitializeResult,
    InitializedParams,
    ProposedFeatures,
    TextDocumentSyncKind,
    createConnection,
} from 'vscode-languageserver/node';

import { collectIncludeFolders } from './processor/include-processor';
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
    }

    protected override onInitialize(ip: InitializeParams): InitializeResult {
        this.collectClientCapabilities(ip);
        return {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Incremental,
                workspace: { workspaceFolders: { supported: true } },
                completionProvider: {},
                documentLinkProvider: { resolveProvider: true },
            },
        };
    }

    protected override async onInitialized(
        ip: InitializedParams
    ): Promise<void> {
        await super.onInitialized(ip);
        await collectIncludeFolders();
    }
}

new ServerDesktop();
