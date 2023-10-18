import {
    Connection,
    ProposedFeatures,
    createConnection,
} from 'vscode-languageserver/node';

import { Server } from './server';

export class ServerDesktop extends Server {
    protected createConnection(): Connection {
        return createConnection(ProposedFeatures.all);
    }
}

new ServerDesktop();
