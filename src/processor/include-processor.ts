import {
    exists,
    getFolderContent,
    loadFile,
    watchFile,
} from '../helper/fs-helper';
import { log } from '../helper/server-helper';

import * as fs from 'fs';
import * as path from 'path';

export type GameFolder = string;
export type ShaderConfig = string;

export let includeFolders = new Map<GameFolder, Map<ShaderConfig, string[]>>();

export async function collectIncludeFolders(): Promise<void> {
    return await new IncludeProcessor().collectIncludeFolders();
}

class IncludeProcessor {
    private static lastId = 0;

    private includeFolders = new Map<GameFolder, Map<ShaderConfig, string[]>>();
    private blkContentCache = new Map<string, string>();
    private blkWatchers: fs.FSWatcher[] = [];
    private id = ++IncludeProcessor.lastId;
    private logAllIncludeFolders = false;

    public async collectIncludeFolders(): Promise<void> {
        const gameFolders = await this.getGameFolders();
        for (const gameFolder of gameFolders) {
            await this.addIncludeFolders(gameFolder);
        }
        this.logIncludeFolders();
        if (this.id === IncludeProcessor.lastId) {
            includeFolders = this.includeFolders;
        }
    }

    private async getGameFolders(): Promise<string[]> {
        let result = await this.getFoldersFrom('.');
        if (await exists('./samples')) {
            const samples = await this.getFoldersFrom('./samples');
            result = result.concat(samples);
        }
        return result;
    }

    private async getFoldersFrom(pathFrom: string): Promise<string[]> {
        const filesAndFolders = await getFolderContent(pathFrom);
        const folders = filesAndFolders.filter((item) => item.isDirectory());
        return folders.map((item) => path.resolve(pathFrom, item.name));
    }

    private async addIncludeFolders(gameFolder: string): Promise<void> {
        const shadersFolder = `${gameFolder}/prog/shaders`;
        if (await exists(shadersFolder)) {
            this.includeFolders.set(gameFolder, new Map());
            const shaderConfigs = await this.getShaderConfigs(shadersFolder);
            for (const shaderConfig of shaderConfigs) {
                await this.addIncludeFoldersFromBlk(
                    gameFolder,
                    shaderConfig,
                    `${shadersFolder}/${shaderConfig}`
                );
            }
        }
    }

    private async getShaderConfigs(shadersFolder: string): Promise<string[]> {
        const filesAndFolders = await getFolderContent(shadersFolder);
        const shaderConfigs = filesAndFolders.filter(
            (item) =>
                item.isFile() &&
                item.name.startsWith('shaders_') &&
                item.name.endsWith('.blk')
        );
        return shaderConfigs.map((item) => item.name);
    }

    private async addIncludeFoldersFromBlk(
        gameFolder: string,
        shaderConfig: string,
        blkPath: string
    ): Promise<void> {
        if (!(await exists(blkPath))) {
            return;
        }
        let result = this.includeFolders.get(gameFolder)?.get(shaderConfig);
        if (!result) {
            result = [];
            this.includeFolders.get(gameFolder)?.set(shaderConfig, result);
        }
        const blkContent = await this.getBlkContent(blkPath);
        this.addIncludeFoldersFromOneBlk(gameFolder, blkContent, result);
        await this.followBlkIncludes(
            gameFolder,
            shaderConfig,
            blkPath,
            blkContent
        );
    }

    private async getBlkContent(blkPath: string): Promise<string> {
        let blkContent = this.blkContentCache.get(blkPath);
        if (!blkContent) {
            this.addFileWatcher(blkPath);
            blkContent = await loadFile(blkPath);
            this.blkContentCache.set(blkPath, blkContent);
        }
        return blkContent;
    }

    private addFileWatcher(blkPath: string): void {
        const watcher = watchFile(blkPath, async () => {
            for (const blkWatcher of this.blkWatchers) {
                blkWatcher.close();
            }
            await collectIncludeFolders();
        });
        this.blkWatchers.push(watcher);
    }

    private addIncludeFoldersFromOneBlk(
        gameFolder: string,
        blkContent: string,
        result: string[]
    ): void {
        const pattern = /(?<=\bincDir\s*:\s*t\s*=\s*").*?(?=")/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = pattern.exec(blkContent))) {
            const relativePath = blkContent.substring(
                regexResult.index,
                regexResult.index + regexResult[0].length
            );
            const workspacePath = path.join(
                `${gameFolder}/prog/shaders`,
                relativePath
            );
            result.push(workspacePath);
        }
    }

    private async followBlkIncludes(
        gameFolder: string,
        shaderConfig: string,
        blkPath: string,
        blkContent: string
    ): Promise<void> {
        let regexResult: RegExpExecArray | null;
        const pattern =
            /((?<=\binclude\s*").*?(?="))|((?<=\binclude\s+)[^"\s]+(?=\s))/g;
        while ((regexResult = pattern.exec(blkContent))) {
            const relativePath = blkContent.substring(
                regexResult.index,
                regexResult.index + regexResult[0].length
            );
            const workspacePath = path.join(
                path.dirname(blkPath),
                relativePath
            );
            await this.addIncludeFoldersFromBlk(
                gameFolder,
                shaderConfig,
                workspacePath
            );
        }
    }

    private logIncludeFolders(): void {
        if (!this.logAllIncludeFolders) {
            return;
        }
        for (const [game, map] of this.includeFolders) {
            log(game);
            for (const [config, map2] of map) {
                log(' '.repeat(4) + config);
                for (const inc of map2) {
                    log(' '.repeat(8) + inc);
                }
            }
        }
    }
}
