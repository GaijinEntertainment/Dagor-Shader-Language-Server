import { exists, getFolderContent, loadFile } from '../helper/fs-helper';
import { log } from '../helper/server-helper';

import * as path from 'path';

export type Game = string;
export type ShaderConfig = string;

export const includeFolders = new Map<Game, Map<ShaderConfig, string[]>>();

const blkContentCache = new Map<string, string>();
const logAllIncludeFolders = false;

export async function collectIncludeFolders(): Promise<void> {
    const gameFolders = await getGameFolders();
    for (const gameFolder of gameFolders) {
        await addIncludeFolders(gameFolder);
    }
    logIncludeFolders();
}

async function getGameFolders(): Promise<string[]> {
    const filesAndFolders = await getFolderContent('.');
    const folders = filesAndFolders.filter((item) => item.isDirectory());
    return folders.map((item) => item.name);
}

async function addIncludeFolders(gameFolder: string): Promise<void> {
    const shadersFolder = `${gameFolder}/prog/shaders`;
    if (await exists(shadersFolder)) {
        includeFolders.set(gameFolder, new Map());
        const shaderConfigs = await getShaderConfigs(shadersFolder);
        for (const shaderConfig of shaderConfigs) {
            await addIncludeFoldersFromBlk(
                gameFolder,
                shaderConfig,
                `${shadersFolder}/${shaderConfig}`
            );
        }
    }
}

async function getShaderConfigs(shadersFolder: string): Promise<string[]> {
    const filesAndFolders = await getFolderContent(shadersFolder);
    const shaderConfigs = filesAndFolders.filter(
        (item) =>
            item.isFile() &&
            item.name.startsWith('shaders_') &&
            item.name.endsWith('.blk')
    );
    return shaderConfigs.map((item) => item.name);
}

async function addIncludeFoldersFromBlk(
    gameFolder: string,
    shaderConfig: string,
    blkPath: string
): Promise<void> {
    if (!(await exists(blkPath))) {
        return;
    }
    let result = includeFolders.get(gameFolder)?.get(shaderConfig);
    if (!result) {
        result = [];
        includeFolders.get(gameFolder)?.set(shaderConfig, result);
    }
    const blkContent = await getBlkContent(blkPath);
    addIncludeFoldersFromOneBlk(gameFolder, blkContent, result);
    await followBlkIncludes(gameFolder, shaderConfig, blkPath, blkContent);
}

async function getBlkContent(blkPath: string): Promise<string> {
    let blkContent = blkContentCache.get(blkPath);
    if (!blkContent) {
        blkContent = await loadFile(blkPath);
        blkContentCache.set(blkPath, blkContent);
    }
    return blkContent;
}

function addIncludeFoldersFromOneBlk(
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

async function followBlkIncludes(
    gameFolder: string,
    shaderConfig: string,
    blkPath: string,
    blkContent: string
): Promise<void> {
    let regexResult: RegExpExecArray | null;
    const pattern =
        /((?<=\binclude\s*").*?(?="))|((?<=\binclude\s+)[^"]*?(?=(\r|\n|$)))/g;
    while ((regexResult = pattern.exec(blkContent))) {
        const relativePath = blkContent.substring(
            regexResult.index,
            regexResult.index + regexResult[0].length
        );
        const workspacePath = path.join(path.dirname(blkPath), relativePath);
        await addIncludeFoldersFromBlk(gameFolder, shaderConfig, workspacePath);
    }
}

function logIncludeFolders(): void {
    if (!logAllIncludeFolders) {
        return;
    }
    for (const [game, map] of includeFolders) {
        log(game);
        for (const [config, map2] of map) {
            log(' '.repeat(4) + config);
            for (const inc of map2) {
                log(' '.repeat(8) + inc);
            }
        }
    }
}
