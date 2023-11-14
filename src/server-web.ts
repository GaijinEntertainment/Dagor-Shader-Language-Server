import {
    BrowserMessageReader,
    BrowserMessageWriter,
    Connection,
    InitializeParams,
    InitializeResult,
    TextDocumentSyncKind,
    createConnection,
} from 'vscode-languageserver/browser';

import { SERVER_NAME, SERVER_VERSION } from './core/constant';
import { Server } from './server';

export class ServerWeb extends Server {
    protected override createConnection(): Connection {
        const messageReader = new BrowserMessageReader(self);
        const messageWriter = new BrowserMessageWriter(self);
        return createConnection(messageReader, messageWriter);
    }

    protected override onInitialize(ip: InitializeParams): InitializeResult {
        return {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Incremental,
                // completionProvider: {},
            },
            serverInfo: {
                name: SERVER_NAME,
                version: SERVER_VERSION,
            },
        };
    }
}

new ServerWeb();
