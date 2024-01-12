import {
    BrowserMessageReader,
    BrowserMessageWriter,
    Connection,
    createConnection,
} from 'vscode-languageserver/browser';

import { HostDependent } from './interface/host-dependent';
import { Server } from './server';

export class ServerWeb extends Server {
    protected override createConnection(): Connection {
        const messageReader = new BrowserMessageReader(self);
        const messageWriter = new BrowserMessageWriter(self);
        return createConnection(messageReader, messageWriter);
    }

    protected override createHostDependent(): HostDependent {
        return {
            documentLinkErrorMessage:
                'Include links are not working in VS Code for the Web.',
            loadFile(file) {
                return Promise.resolve('');
            },
            exists(path) {
                return Promise.resolve(false);
            },
            isFile(path) {
                return Promise.resolve(false);
            },
            getFolderContent(path) {
                return Promise.resolve([]);
            },
            watchFile(path, callback) {
                return {
                    close() {},
                };
            },
        };
    }
}

new ServerWeb();
