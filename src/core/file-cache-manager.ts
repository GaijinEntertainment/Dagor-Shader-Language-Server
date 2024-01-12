import { loadFile, watchFile } from '../helper/file-helper';
import { FileWatcher } from '../interface/file-watcher';
import {
    collectIncludeFolders,
    collectOverrideIncludeFolders,
} from '../processor/include-processor';
import { getConfiguration } from './configuration-manager';
import { log, logCachingBehavior } from './debug';

interface FileCache {
    watcher: FileWatcher;
    content: string;
    cached: number;
    caching: number;
    cachingPromise?: Promise<string>;
    lastModified: number;
}

const fileCache = new Map<string, FileCache>();

export async function getFileContent(path: string): Promise<string> {
    const cacheEntry = fileCache.get(path);
    if (cacheEntry) {
        const caching = cacheEntry.lastModified;
        if (caching <= cacheEntry.cached) {
            logCaching('CACHE HIT', path);
            return cacheEntry.content;
        } else if (caching <= cacheEntry.caching && cacheEntry.cachingPromise) {
            logCaching('CACHE MISS (WAIT)', path);
            return await cacheEntry.cachingPromise;
        } else {
            cacheEntry.caching = caching;
            cacheEntry.cachingPromise = loadFile(path);
            logCaching('CACHE MISS (LOAD)', path);
            const content = await cacheEntry.cachingPromise;
            if (cacheEntry.cached > caching) {
                return cacheEntry.content;
            } else {
                cacheEntry.content = content;
                cacheEntry.cached = caching;
                return content;
            }
        }
    } else {
        return await loadFromFile(path);
    }
}

async function loadFromFile(path: string): Promise<string> {
    const watcher = watchFile(path, (_path) => {
        const cacheEntry = fileCache.get(path);
        if (cacheEntry) {
            cacheEntry.lastModified++;
            if (path.endsWith('.blk')) {
                if (getConfiguration().shaderConfigOverride) {
                    collectOverrideIncludeFolders();
                } else {
                    collectIncludeFolders();
                }
            }
        }
    });
    const caching = 1;
    const cacheEntry: FileCache = {
        content: '',
        watcher,
        cached: 0,
        caching,
        lastModified: caching,
    };
    fileCache.set(path, cacheEntry);
    cacheEntry.cachingPromise = loadFile(path);
    logCaching('CACHE MISS (LOAD FIRST)', path);
    const content = await cacheEntry.cachingPromise;
    if (cacheEntry.cached > caching) {
        return cacheEntry.content;
    } else {
        cacheEntry.content = content;
        cacheEntry.cached = caching;
        return content;
    }
}

function logCaching(message: string, path: string): void {
    if (!logCachingBehavior) {
        return;
    }
    log(`${message}: ${path}`);
}

export function clearCache(): void {
    for (const cacheEntry of fileCache.values()) {
        cacheEntry.watcher.close();
    }
    fileCache.clear();
}
