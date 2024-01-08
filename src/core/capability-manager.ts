import { ClientCapabilities } from 'vscode-languageserver';

import { Capabilities } from '../interface/capabilities';

const capabilities: Capabilities = {
    configuration: false,
    configurationChange: false,
    definition: false,
    definitionLink: false,
    documentLink: false,
    documentLinkTooltip: false,
    showMessage: false,
    workspaceFolders: false,
    watchFiles: false,
};

export function initializeCapabilities(
    clientCapabilities: ClientCapabilities
): void {
    capabilities.configuration = !!clientCapabilities.workspace?.configuration;
    capabilities.configurationChange =
        !!clientCapabilities.workspace?.didChangeConfiguration;
    capabilities.definition = !!clientCapabilities.textDocument?.definition;
    capabilities.definitionLink =
        !!clientCapabilities.textDocument?.definition?.linkSupport;
    capabilities.documentLink = !!clientCapabilities.textDocument?.documentLink;
    capabilities.documentLinkTooltip =
        !!clientCapabilities.textDocument?.documentLink?.tooltipSupport;
    capabilities.showMessage = !!clientCapabilities.window?.showMessage;
    capabilities.workspaceFolders =
        !!clientCapabilities.workspace?.workspaceFolders;
    capabilities.watchFiles =
        !!clientCapabilities.workspace?.didChangeWatchedFiles;
}

export function getCapabilities(): Capabilities {
    return capabilities;
}
