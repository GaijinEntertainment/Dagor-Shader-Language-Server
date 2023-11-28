import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { Server } from '../server';

export async function syncInitialization(): Promise<void> {
    return Server.getServer().syncInitialization();
}

export function getDocuments(): TextDocuments<TextDocument> {
    return Server.getServer().getDocuments();
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
