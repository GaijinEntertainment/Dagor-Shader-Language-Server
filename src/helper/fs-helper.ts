import * as chokidar from 'chokidar';
import * as fs from 'fs';
import * as fsp from 'fs/promises';

export async function loadFile(file: string): Promise<string> {
    return await fsp.readFile(file, 'utf8');
}

export async function exists(path: string): Promise<boolean> {
    try {
        await fsp.access(path, fsp.constants.R_OK);
        return true;
    } catch {
        // folder or file doesn't exist
        return false;
    }
}

export async function getFolderContent(path: string): Promise<fs.Dirent[]> {
    return await fsp.readdir(path, { withFileTypes: true });
}

export function watchFile(
    path: string,
    callback: (path: string, stats?: fs.Stats) => void
): chokidar.FSWatcher {
    return chokidar.watch(path).on('change', callback);
}

export async function isFile(path: string): Promise<boolean> {
    const stat = await fsp.stat(path);
    return stat.isFile();
}
