import { ClientCapabilities } from 'vscode-languageserver';

import { Capabilities } from '../interface/capabilities';

const capabilities: Capabilities = {
    completionDocumentationFormat: [],
    completionLabelDetails: false,
    completionItemKinds: [],
    completionSnippets: false,
    configuration: false,
    configurationChange: false,
    declarationLink: false,
    definitionLink: false,
    documentLinkTooltip: false,
    documentSymbolHierarchy: false,
    foldingRangeKinds: [],
    hoverFormat: [],
    implementationLink: false,
    showMessage: false,
    signatureHelpActiveParameter: false,
};

export function initializeCapabilities(clientCapabilities: ClientCapabilities): void {
    capabilities.completionDocumentationFormat =
        clientCapabilities.textDocument?.completion?.completionItem?.documentationFormat ?? [];
    capabilities.completionLabelDetails =
        !!clientCapabilities.textDocument?.completion?.completionItem?.labelDetailsSupport;
    capabilities.completionItemKinds = clientCapabilities.textDocument?.completion?.completionItemKind?.valueSet ?? [];
    capabilities.completionSnippets = !!clientCapabilities.textDocument?.completion?.completionItem?.snippetSupport;
    capabilities.configuration = !!clientCapabilities.workspace?.configuration;
    capabilities.configurationChange = !!clientCapabilities.workspace?.didChangeConfiguration;
    capabilities.declarationLink = !!clientCapabilities.textDocument?.declaration?.linkSupport;
    capabilities.definitionLink = !!clientCapabilities.textDocument?.definition?.linkSupport;
    capabilities.documentLinkTooltip = !!clientCapabilities.textDocument?.documentLink?.tooltipSupport;
    capabilities.documentSymbolHierarchy =
        !!clientCapabilities.textDocument?.documentSymbol?.hierarchicalDocumentSymbolSupport;
    capabilities.foldingRangeKinds = clientCapabilities.textDocument?.foldingRange?.foldingRangeKind?.valueSet ?? [];
    capabilities.hoverFormat = clientCapabilities.textDocument?.hover?.contentFormat ?? [];
    capabilities.implementationLink = !!clientCapabilities.textDocument?.implementation?.linkSupport;
    capabilities.showMessage = !!clientCapabilities.window?.showMessage;
    capabilities.signatureHelpActiveParameter =
        !!clientCapabilities.textDocument?.signatureHelp?.signatureInformation?.activeParameterSupport;
}

export function getCapabilities(): Capabilities {
    return capabilities;
}
