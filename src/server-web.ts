import {
    BrowserMessageReader,
    BrowserMessageWriter,
    Connection,
    createConnection,
} from 'vscode-languageserver/browser';

import { Server } from './server';

export class ServerWeb extends Server {
    protected createConnection(): Connection {
        const messageReader = new BrowserMessageReader(self);
        const messageWriter = new BrowserMessageWriter(self);
        return createConnection(messageReader, messageWriter);
    }
}

new ServerWeb();
