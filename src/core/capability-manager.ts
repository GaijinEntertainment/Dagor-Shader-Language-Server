import { ClientCapabilities } from 'vscode-languageserver';

import { Capabilities } from '../interface/capabilities';

const capabilities: Capabilities = {
    configuration: false,
    configurationChange: false,
    documentLink: false,
    documentLinkTooltip: false,
    showMessage: false,
    workspaceFolders: false,
};

export function initializeCapabilities(
    clientCapabilities: ClientCapabilities
): void {
    capabilities.configuration = !!clientCapabilities.workspace?.configuration;
    capabilities.configurationChange =
        !!clientCapabilities.workspace?.didChangeConfiguration;
    capabilities.documentLink = !!clientCapabilities.textDocument?.documentLink;
    capabilities.documentLinkTooltip =
        !!clientCapabilities.textDocument?.documentLink?.tooltipSupport;
    capabilities.showMessage = !!clientCapabilities.window?.showMessage;
    capabilities.workspaceFolders =
        !!clientCapabilities.workspace?.workspaceFolders;
}

export function getCapabilities(): Capabilities {
    return capabilities;
}
