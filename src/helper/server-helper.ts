import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Server } from '../server';

export function getDocuments(): TextDocuments<TextDocument> {
    return Server.getServer().getDocuments();
}

export function getWorkspaceFolder(): string {
    return Server.getServer().getWorkspaceFolder();
}

export function showInfoMessage(message: string): void {
    Server.getServer().showInfoMessage(message);
}

export function showWarningMessage(message: string): void {
    Server.getServer().showWarningMessage(message);
}

export function showErrorMessage(message: string): void {
    Server.getServer().showErrorMessage(message);
}

export function log(message: string): void {
    Server.getServer().log(message);
}

export function logInfo(message: string): void {
    Server.getServer().logInfo(message);
}

export function logWarning(message: string): void {
    Server.getServer().logWarning(message);
}

export function logError(message: string): void {
    Server.getServer().logError(message);
}
