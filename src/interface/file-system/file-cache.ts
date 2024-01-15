import { FileWatcher } from './file-watcher';

export interface FileCache {
    watcher: FileWatcher;
    content: string;
    cached: number;
    caching: number;
    cachingPromise?: Promise<string>;
    lastModified: number;
}
