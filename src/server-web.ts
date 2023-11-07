import {
    BrowserMessageReader,
    BrowserMessageWriter,
    Connection,
    InitializeParams,
    InitializeResult,
    TextDocumentSyncKind,
    createConnection,
} from 'vscode-languageserver/browser';

import { Server } from './server';

export class ServerWeb extends Server {
    protected override createConnection(): Connection {
        const messageReader = new BrowserMessageReader(self);
        const messageWriter = new BrowserMessageWriter(self);
        return createConnection(messageReader, messageWriter);
    }

    protected override onInitialize(ip: InitializeParams): InitializeResult {
        this.collectClientCapabilities(ip);
        return {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Incremental,
                completionProvider: {},
            },
        };
    }
}

new ServerWeb();
