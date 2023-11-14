import {
    CompletionItem,
    CompletionItemKind,
    Connection,
    Diagnostic,
    DiagnosticSeverity,
    InitializeParams,
    InitializeResult,
    InitializedParams,
    TextDocumentPositionParams,
    TextDocuments,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
    getCapabilities,
    initializeCapabilities,
} from './core/capability-manager';

import { Configuration } from './core/configuration';
import { initializeConfiguration } from './core/configuration-manager';
import { initializeDebug } from './core/debug';

export abstract class Server {
    private static server: Server;

    protected connection: Connection;
    protected documents: TextDocuments<TextDocument>;

    public static getServer(): Server {
        return Server.server;
    }

    public constructor() {
        Server.server = this;
        this.connection = this.createConnection();
        this.documents = new TextDocuments(TextDocument);
        this.initialize();
        this.addFeatures();
        this.listen();
    }

    protected abstract createConnection(): Connection;

    private initialize(): void {
        initializeDebug(this.connection);
        this.connection.onInitialize((ip: InitializeParams) => {
            initializeCapabilities(ip.capabilities);
            return this.onInitialize(ip);
        });
        this.connection.onInitialized(async (ip: InitializedParams) => {
            await initializeConfiguration(this.connection);
            await this.onInitialized(ip);
        });
    }

    protected abstract onInitialize(ip: InitializeParams): InitializeResult;

    protected async onInitialized(ip: InitializedParams): Promise<void> {}

    public async configurationChanged(
        oldConfiguration: Configuration,
        newConfiguration: Configuration
    ): Promise<void> {}

    public getDocuments(): TextDocuments<TextDocument> {
        return this.documents;
    }

    public showInfoMessage(message: string): void {
        if (!getCapabilities().showMessage) {
            return;
        }
        this.connection.window.showInformationMessage(message);
    }

    public showWarningMessage(message: string): void {
        if (!getCapabilities().showMessage) {
            return;
        }
        this.connection.window.showWarningMessage(message);
    }

    public showErrorMessage(message: string): void {
        if (!getCapabilities().showMessage) {
            return;
        }
        this.connection.window.showErrorMessage(message);
    }

    protected addFeatures(): void {
        // this.addMockedCodeCompletion();
        // this.addMockedDiagnostics();
    }

    private addMockedCodeCompletion(): void {
        this.connection.onCompletion(
            (tdpp: TextDocumentPositionParams): CompletionItem[] => {
                return [
                    {
                        label: 'Test code completion item 1',
                        kind: CompletionItemKind.Text,
                    },
                    {
                        label: 'Test code completion item 2',
                        kind: CompletionItemKind.Class,
                    },
                ];
            }
        );
    }

    private addMockedDiagnostics(): void {
        this.documents.onDidChangeContent((change) => {
            const textDocument = change.document;
            const text = textDocument.getText();
            const pattern = /\b[A-Z]{2,}\b/g;
            let m: RegExpExecArray | null;

            const diagnostics: Diagnostic[] = [];
            while ((m = pattern.exec(text))) {
                const diagnostic: Diagnostic = {
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: textDocument.positionAt(m.index),
                        end: textDocument.positionAt(m.index + m[0].length),
                    },
                    message: `${m[0]} is all uppercase.`,
                };
                diagnostics.push(diagnostic);
            }

            this.connection.sendDiagnostics({
                uri: textDocument.uri,
                diagnostics,
            });
        });
    }

    private listen(): void {
        this.documents.listen(this.connection);
        this.connection.listen();
    }
}
