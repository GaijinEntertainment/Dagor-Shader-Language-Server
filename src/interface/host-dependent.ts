import { FileSystemItemInfo } from './file-system-item-info';
import { FileWatcher } from './file-watcher';

export interface HostDependent {
    documentLinkErrorMessage: string;
    loadFile(file: string): Promise<string>;
    exists(path: string): Promise<boolean>;
    getFolderContent(path: string): Promise<FileSystemItemInfo[]>;
    watchFile(path: string, callback: (path: string) => void): FileWatcher;
    isFile(path: string): Promise<boolean>;
}
