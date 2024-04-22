import { CompletionItemKind, FoldingRangeKind, MarkupKind, SymbolKind } from 'vscode-languageserver';

export interface Capabilities {
    completionDocumentationFormat: MarkupKind[];
    completionLabelDetails: boolean;
    completionItemKinds: CompletionItemKind[];
    completionSnippets: boolean;
    configuration: boolean;
    configurationChange: boolean;
    declarationLink: boolean;
    definitionLink: boolean;
    diagnostics: boolean;
    diagnosticsVersion: boolean;
    documentSymbolHierarchy: boolean;
    documentSymbolSymbolKinds: SymbolKind[];
    foldingRangeKinds: FoldingRangeKind[];
    hoverFormat: MarkupKind[];
    implementationLink: boolean;
    inlayHints: boolean;
    showMessage: boolean;
    signatureHelpActiveParameter: boolean;
    signatureHelpContext: boolean;
}
