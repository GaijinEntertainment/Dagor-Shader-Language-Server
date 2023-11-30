import { Connection } from 'vscode-languageserver';

export const logShaderConfigs = false;
export const showDocumentLinkDebugLabel = false;
export const logDocumentLinkResolveShaderConfig = false;
export const collectAndLogPerformance = false;

let connection: Connection;

export function initializeDebug(serverConnection: Connection): void {
    connection = serverConnection;
}

export function log(message: string): void {
    connection.console.log(message);
}

export function logInfo(message: string): void {
    connection.console.info(message);
}

export function logWarning(message: string): void {
    connection.console.warn(message);
}

export function logError(message: string): void {
    connection.console.error(message);
}
