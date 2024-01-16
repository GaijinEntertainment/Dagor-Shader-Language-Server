import { FileSystemItemInfo } from '../interface/file-system/file-system-item-info';
import { FileWatcher } from '../interface/file-system/file-watcher';
import { Server } from '../server';

export async function exists(path: string): Promise<boolean> {
    return await Server.getHostDependent().exists(path);
}

export async function isFile(path: string): Promise<boolean> {
    return await Server.getHostDependent().isFile(path);
}

export async function loadFile(file: string): Promise<string> {
    return await Server.getHostDependent().loadFile(file);
}

export async function getFolderContent(file: string): Promise<FileSystemItemInfo[]> {
    return await Server.getHostDependent().getFolderContent(file);
}

export function watchFile(path: string, callback: (path: string) => void): FileWatcher {
    return Server.getHostDependent().watchFile(path, callback);
}

export function getDocumentLinkErrorMessage(): string {
    return Server.getHostDependent().documentLinkErrorMessage;
}
