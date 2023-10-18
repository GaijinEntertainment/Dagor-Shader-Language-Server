import {
	CompletionItem,
	CompletionItemKind,
	Connection,
	Diagnostic,
	DiagnosticSeverity,
	InitializeParams,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	TextDocuments,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

export abstract class Server {
	protected connection: Connection;
	protected documents: TextDocuments<TextDocument>;

	public constructor() {
		this.connection = this.createConnection();
		this.documents = new TextDocuments(TextDocument);
		this.onInitialize();
		this.addFeatures();
		this.listen();
	}

	protected abstract createConnection(): Connection;

	private onInitialize(): void {
		this.connection.onInitialize((ip: InitializeParams) => {
			return {
				capabilities: {
					textDocumentSync: TextDocumentSyncKind.Incremental,
					completionProvider: {},
				},
			};
		});
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
