import * as path from 'path';

import { getConfiguration } from '../core/configuration-manager';
import { log, logShaderConfigs } from '../core/debug';
import { getFileContent } from '../core/file-cache-manager';
import { exists, getFolderContent } from '../helper/file-helper';
import { PerformanceHelper } from '../helper/performance-helper';
import { getRootFolder, showWarningMessage } from '../helper/server-helper';

export type GameFolder = string;
export type ShaderConfig = string;

export let includeFolders = new Map<GameFolder, Map<ShaderConfig, string[]>>();
export let overrideIncludeFolders: string[] = [];

let includesCollected = Promise.resolve();

export async function collectIncludeFolders(): Promise<void> {
    includesCollected = new IncludeProcessor().collectIncludeFolders();
    await includesCollected;
}

export async function collectOverrideIncludeFolders(): Promise<void> {
    includesCollected = new IncludeProcessor().collectOverrideIncludeFolders();
    await includesCollected;
}

export async function syncIncludeFoldersCollection(): Promise<void> {
    return includesCollected;
}

class IncludeProcessor {
    private static lastId = 0;

    private includeFolders = new Map<GameFolder, Map<ShaderConfig, string[]>>();
    private overrideIncludeFolders: string[] = [];
    private id = ++IncludeProcessor.lastId;
    private override = false;

    public async collectIncludeFolders(): Promise<void> {
        const ph = new PerformanceHelper();
        ph.start('collectIncludeFolders');
        const gameFolders = await this.getGameFolders();
        for (const gameFolder of gameFolders) {
            await this.addIncludeFolders(gameFolder);
        }
        this.logIncludeFolders();
        if (this.id === IncludeProcessor.lastId) {
            includeFolders = this.includeFolders;
        }
        ph.end('collectIncludeFolders');
        ph.log('collecting include folders', 'collectIncludeFolders');
    }

    public async collectOverrideIncludeFolders(): Promise<void> {
        this.override = true;
        const shaderConfig = path.resolve(
            getConfiguration().shaderConfigOverride
        );
        if (await exists(shaderConfig)) {
            await this.addIncludeFoldersFromBlk('', shaderConfig, shaderConfig);
        } else {
            showWarningMessage(
                `Couldn't find the shader config file: ${shaderConfig}`
            );
        }
        this.logOverrideIncludeFolders();
        if (this.id === IncludeProcessor.lastId) {
            overrideIncludeFolders = this.overrideIncludeFolders;
        }
    }

    private async getGameFolders(): Promise<string[]> {
        let result = await this.getFoldersFrom('.');
        const absoluteSamplesPath = path.resolve(getRootFolder(), 'samples');
        if (await exists(absoluteSamplesPath)) {
            const samples = await this.getFoldersFrom('samples');
            result = result.concat(samples);
        }
        return result;
    }

    private async getFoldersFrom(pathFrom: string): Promise<string[]> {
        const absolutePath = path.resolve(getRootFolder(), pathFrom);
        const filesAndFolders = await getFolderContent(absolutePath);
        const folders = filesAndFolders.filter((item) => item.isDirectory());
        return folders.map((item) => path.join(pathFrom, item.name));
    }

    private async addIncludeFolders(gameFolder: string): Promise<void> {
        const shadersFolder = path.resolve(
            getRootFolder(),
            gameFolder,
            'prog/shaders'
        );
        if (await exists(shadersFolder)) {
            this.includeFolders.set(gameFolder, new Map());
            const shaderConfigs = await this.getShaderConfigs(shadersFolder);
            for (const shaderConfig of shaderConfigs) {
                const shaderConfigPath = path.join(shadersFolder, shaderConfig);
                await this.addIncludeFoldersFromBlk(
                    gameFolder,
                    shaderConfigPath,
                    shaderConfigPath
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
        const result = this.getResults(shaderConfig, gameFolder);
        const blkContent = await getFileContent(blkPath);
        this.addIncludeFoldersFromOneBlk(shaderConfig, blkContent, result);
        await this.followBlkIncludes(
            gameFolder,
            shaderConfig,
            blkPath,
            blkContent
        );
    }

    private getResults(shaderConfig: string, gameFolder: string): string[] {
        if (this.override) {
            return this.overrideIncludeFolders;
        } else {
            let result = this.includeFolders.get(gameFolder)?.get(shaderConfig);
            if (!result) {
                result = [];
                this.includeFolders.get(gameFolder)?.set(shaderConfig, result);
            }
            return result;
        }
    }

    private addIncludeFoldersFromOneBlk(
        shaderConfig: string,
        blkContent: string,
        result: string[]
    ): void {
        const incDirRegex = /(?<=\bincDir\s*:\s*t\s*=\s*")[^"]*(?=")/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = incDirRegex.exec(blkContent))) {
            const relativePath = blkContent.substring(
                regexResult.index,
                regexResult.index + regexResult[0].length
            );
            const workspacePath = path.join(
                path.dirname(shaderConfig),
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
        const includeRegex =
            /((?<=\binclude\s*")[^"]*(?="))|((?<=\binclude\s+)[^"\s]+?(?=\s))/g;
        while ((regexResult = includeRegex.exec(blkContent))) {
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
        if (!logShaderConfigs) {
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

    private logOverrideIncludeFolders(): void {
        if (!logShaderConfigs) {
            return;
        }
        for (const includeFolder of this.overrideIncludeFolders) {
            log(includeFolder);
        }
    }
}
