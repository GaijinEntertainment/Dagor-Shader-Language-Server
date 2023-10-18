import {
	CompletionItem,
	CompletionItemKind,
	Diagnostic,
	DiagnosticSeverity,
	InitializeParams,
	ProposedFeatures,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	TextDocuments,
	createConnection,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((ip: InitializeParams) => {
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			completionProvider: {},
		},
	};
});

documents.onDidChangeContent((change) => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
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

	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onCompletion(
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

documents.listen(connection);
connection.listen();
