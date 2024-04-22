import {
    Connection,
    DocumentRangesFormattingRequest,
    InitializeParams,
    InitializeResult,
    InitializedParams,
    InlayHintRequest,
    PublishDiagnosticsParams,
    ServerCapabilities,
    TextDocumentSyncKind,
    TextDocuments,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

import { getCapabilities, initializeCapabilities } from './core/capability-manager';
import { initializeConfiguration } from './core/configuration-manager';
import { SERVER_NAME, SERVER_VERSION } from './core/constant';
import { initializeDebug } from './core/debug';
import { getDocumentInfo } from './core/document-manager';
import { Configuration } from './interface/configuration';
import { HostDependent } from './interface/host-dependent';
import { completionProvider } from './provider/completion-provider';
import { declarationProvider } from './provider/declaration-provider';
import { definitionProvider } from './provider/definition-provider';
import { documentHighlightProvider } from './provider/document-highlight-provider';
import { documentSymbolProvider } from './provider/document-symbol-provider';
import { foldingRangesProvider } from './provider/folding-ranges-provider';
import {
    documentFormattingProvider,
    documentRangeFormattingProvider,
    documentRangesFormattingProvider,
} from './provider/formatting-provider';
import { hoverProvider } from './provider/hover-provider';
import { implementationProvider } from './provider/implementation-provider';
import { inlayHintProvider } from './provider/inlay-hint-provider';
import { signatureHelpProvider } from './provider/signature-help-provider';
import { typeDefinitionProvider } from './provider/type-definition-provider';

export abstract class Server {
    private static server: Server;
    private static hostDependent: HostDependent;

    protected connection: Connection;
    protected documents: TextDocuments<TextDocument>;
    protected initialized = Promise.resolve();
    protected rootFolder = '';

    public static getServer(): Server {
        return Server.server;
    }

    public static getHostDependent(): HostDependent {
        return Server.hostDependent;
    }

    public constructor() {
        Server.server = this;
        Server.hostDependent = this.createHostDependent();
        this.connection = this.createConnection();
        this.documents = new TextDocuments(TextDocument);
        this.initialize();
        this.addFeatures();
        this.listen();
    }

    protected abstract createConnection(): Connection;

    protected abstract createHostDependent(): HostDependent;

    private initialize(): void {
        initializeDebug(this.connection);
        this.connection.onInitialize((ip: InitializeParams) => {
            // rootUri and rootPath are deprecated, however, workspaceFolders isn't supported by Visual Studio
            this.rootFolder = URI.parse(ip.rootUri ?? ip.rootPath ?? '').fsPath;
            initializeCapabilities(ip.capabilities);
            return this.onInitialize(ip);
        });
        this.initialized = new Promise((resolve) => {
            this.connection.onInitialized(async (ip: InitializedParams) => {
                await initializeConfiguration(this.connection);
                await this.onInitialized(ip);
                resolve();
            });
        });
        this.documents.onDidOpen((e) => {
            getDocumentInfo(e.document.uri)?.opened(e.document);
        });
        this.documents.onDidClose((e) => {
            getDocumentInfo(e.document.uri)?.closed();
        });
        this.connection.onShutdown((_token) => {
            this.onShutdown();
        });
    }

    protected onInitialize(ip: InitializeParams): InitializeResult {
        return {
            capabilities: this.getServerCapabilities(),
            serverInfo: {
                name: SERVER_NAME,
                version: SERVER_VERSION,
            },
        };
    }

    protected getServerCapabilities(): ServerCapabilities {
        return {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                triggerCharacters: ['"', '<', '/', '\\'],
                completionItem: {
                    labelDetailsSupport: true,
                },
            },
            declarationProvider: true,
            definitionProvider: true,
            typeDefinitionProvider: true,
            documentHighlightProvider: true,
            documentSymbolProvider: true,
            foldingRangeProvider: true,
            hoverProvider: true,
            implementationProvider: true,
            inlayHintProvider: { documentSelector: [{ language: 'dshl' }, { language: 'hlsl' }] },
            signatureHelpProvider: { triggerCharacters: ['(', ','] },
            documentFormattingProvider: true,
            documentRangeFormattingProvider: { rangesSupport: true },
        };
    }

    protected async onInitialized(ip: InitializedParams): Promise<void> {}

    protected onShutdown(): void {}

    public syncInitialization(): Promise<void> {
        return this.initialized;
    }

    public async configurationChanged(
        oldConfiguration: Configuration,
        newConfiguration: Configuration
    ): Promise<void> {}

    public getDocuments(): TextDocuments<TextDocument> {
        return this.documents;
    }

    public getRootFolder(): string {
        return this.rootFolder;
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
        this.connection.onCompletion(completionProvider);
        this.connection.onDeclaration(declarationProvider);
        this.connection.onDefinition(definitionProvider);
        this.connection.onTypeDefinition(typeDefinitionProvider);
        this.connection.onDocumentHighlight(documentHighlightProvider);
        this.connection.onDocumentSymbol(documentSymbolProvider);
        this.connection.onFoldingRanges(foldingRangesProvider);
        this.connection.onHover(hoverProvider);
        this.connection.onImplementation(implementationProvider);
        this.connection.onSignatureHelp(signatureHelpProvider);
        this.connection.onDocumentFormatting(documentFormattingProvider);
        this.connection.onDocumentRangeFormatting(documentRangeFormattingProvider);
        this.connection.onRequest(DocumentRangesFormattingRequest.type, documentRangesFormattingProvider);
        this.connection.onRequest(InlayHintRequest.type, inlayHintProvider);
        this.documents.onDidChangeContent((_change) => {
            this.refreshInlayHints();
        });
    }

    public refreshInlayHints(): void {
        if (getCapabilities().inlayHints) {
            this.connection.languages.inlayHint.refresh();
        }
    }

    public async sendDiagnostics(diagnostics: PublishDiagnosticsParams): Promise<void> {
        this.connection.sendDiagnostics(diagnostics);
    }

    private listen(): void {
        this.documents.listen(this.connection);
        this.connection.listen();
    }
}
