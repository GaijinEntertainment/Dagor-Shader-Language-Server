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

export abstract class Server {
    protected connection: Connection;
    protected documents: TextDocuments<TextDocument>;
    protected workspaceFolder = '';
    protected supportWorkspaceFolders = false;

    private static server: Server;

    public static getServer(): Server {
        return Server.server;
    }

    public async getConfig(name: string): Promise<any> {
        return await this.connection.workspace.getConfiguration(name);
    }

    public constructor() {
        this.connection = this.createConnection();
        this.documents = new TextDocuments(TextDocument);
        this.initialize();
        this.addFeatures();
        this.listen();
        Server.server = this;
    }

    protected abstract createConnection(): Connection;

    private initialize(): void {
        this.connection.onInitialize((ip: InitializeParams) => {
            return this.onInitialize(ip);
        });
        this.connection.onInitialized(async (ip: InitializedParams) => {
            await this.onInitialized(ip);
        });
    }

    protected abstract onInitialize(ip: InitializeParams): InitializeResult;

    protected async onInitialized(ip: InitializedParams): Promise<void> {
        if (this.supportWorkspaceFolders) {
            const wfs = await this.connection.workspace.getWorkspaceFolders();
            if (wfs?.length) {
                this.workspaceFolder = wfs[0].uri;
            }
        }
    }

    protected collectClientCapabilities(ip: InitializeParams): void {
        this.supportWorkspaceFolders =
            ip.capabilities.workspace?.workspaceFolders ?? false;
    }

    public getDocuments(): TextDocuments<TextDocument> {
        return this.documents;
    }

    public getWorkspaceFolder(): string {
        return this.workspaceFolder;
    }

    public showInfoMessage(message: string): void {
        this.connection.window.showInformationMessage(message);
    }

    public showWarningMessage(message: string): void {
        this.connection.window.showWarningMessage(message);
    }

    public showErrorMessage(message: string): void {
        this.connection.window.showErrorMessage(message);
    }

    public log(message: string): void {
        this.connection.console.log(message);
    }

    public logInfo(message: string): void {
        this.connection.console.info(message);
    }

    public logWarning(message: string): void {
        this.connection.console.warn(message);
    }

    public logError(message: string): void {
        this.connection.console.error(message);
    }

    protected addFeatures(): void {
        this.addMockedCodeCompletion();
        this.addMockedDiagnostics();
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
