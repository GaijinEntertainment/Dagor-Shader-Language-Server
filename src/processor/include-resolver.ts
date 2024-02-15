import * as path from 'path';
import { DocumentUri, Position } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { getConfiguration } from '../core/configuration-manager';
import { DSHL_EXTENSION, HLSLI_EXTENSION, HLSL_EXTENSION } from '../core/constant';
import { log, logDocumentLinkResolveShaderConfig } from '../core/debug';
import { exists, getFolderContent, isFile } from '../helper/file-helper';
import { FileSystemItemInfo } from '../interface/file-system/file-system-item-info';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { ShaderConfig, includeFolders, overrideIncludeFolders } from './include-processor';

export async function getIncludeCompletionInfos(
    is: IncludeStatement,
    position: Position
): Promise<FileSystemItemInfo[]> {
    const completionPath = getCompletionPath(is, position);
    const result: FileSystemItemInfo[] = [];
    const includerFileName = path.parse(is.includerUri).base;
    const includerUri = URI.parse(is.includerUri).fsPath;
    await addLocalItems(is, completionPath, includerUri, includerFileName, result);
    await addIncludePathItems(is, completionPath, includerFileName, result);
    return result;
}

async function addLocalItems(
    is: IncludeStatement,
    completionPath: string,
    includerUri: string,
    includerFileName: string,
    result: FileSystemItemInfo[]
): Promise<void> {
    if (is.type !== IncludeType.HLSL_ANGULAR) {
        const includedUri = path.join(includerUri, '..', completionPath);
        if ((await exists(includedUri)) && !(await isFile(includedUri))) {
            const content = await getFolderContent(includedUri);
            result.push(...content.filter((fsi) => filterLocalItems(fsi, includerFileName, is.type)));
        }
    }
}

async function addIncludePathItems(
    is: IncludeStatement,
    completionPath: string,
    includerFileName: string,
    result: FileSystemItemInfo[]
): Promise<void> {
    const includeFolders = getIncludeFolders();
    for (const includeFolder of includeFolders) {
        const includedUri = path.join(includeFolder, completionPath);
        if ((await exists(includedUri)) && !(await isFile(includedUri))) {
            const content = await getFolderContent(includedUri);
            result.push(...content.filter((fsi) => filterIncludePathItems(fsi, result, includerFileName, is.type)));
        }
    }
}

function filterLocalItems(fsi: FileSystemItemInfo, includerFileName: string, type: IncludeType): boolean {
    if (fsi.isDirectory()) {
        return true;
    }
    if (fsi.name === includerFileName) {
        return false;
    }
    if (type === IncludeType.DSHL) {
        return fsi.name.endsWith(DSHL_EXTENSION);
    } else {
        return fsi.name.endsWith(HLSL_EXTENSION) || fsi.name.endsWith(HLSLI_EXTENSION);
    }
}

function filterIncludePathItems(
    fsi: FileSystemItemInfo,
    result: FileSystemItemInfo[],
    includerFileName: string,
    type: IncludeType
): boolean {
    if (result.some((r) => r.name === fsi.name)) {
        return false;
    }
    return filterLocalItems(fsi, includerFileName, type);
}

function getCompletionPath(is: IncludeStatement, position: Position): string {
    if (is.pathOriginalRange.start.line !== position.line) {
        return is.path;
    }
    const cursorOffset = position.character - is.pathOriginalRange.start.character;
    const pathBeforeCursor = is.path.substring(0, cursorOffset);
    const lastIndex = Math.max(pathBeforeCursor.lastIndexOf('/'), pathBeforeCursor.lastIndexOf('\\'));
    return lastIndex === -1 ? '' : pathBeforeCursor.substring(0, lastIndex);
}

export async function getIncludedDocumentUri(is: IncludeStatement | null): Promise<DocumentUri | null> {
    if (!is) {
        return null;
    }
    if (is.type !== IncludeType.HLSL_ANGULAR) {
        const uri = await getRelativeDocumentUri(is);
        if (uri) {
            return uri;
        }
    }
    const uri = await getDocumentUriInIncludeFolder(is);
    if (uri) {
        return uri;
    }
    return null;
}

async function getRelativeDocumentUri(is: IncludeStatement): Promise<DocumentUri | null> {
    const includerUri = URI.parse(is.includerUri).fsPath;
    const includedUri = path.join(includerUri, '..', is.path);
    if (includerUri !== includedUri && (await exists(includedUri)) && (await isFile(includedUri))) {
        return URI.file(includedUri).toString();
    }
    return null;
}

async function getDocumentUriInIncludeFolder(is: IncludeStatement): Promise<DocumentUri | null> {
    const includeFolders = getIncludeFolders();
    for (const includeFolder of includeFolders) {
        const includedUri = path.join(includeFolder, is.path);
        if ((await exists(includedUri)) && (await isFile(includedUri))) {
            return URI.file(includedUri).toString();
        }
    }
    return null;
}

function getIncludeFolders(): string[] {
    if (getConfiguration().shaderConfigOverride) {
        return overrideIncludeFolders;
    }
    if (!includeFolders.size) {
        return [];
    }
    const game = getGame();
    if (!game) {
        return [];
    }
    const shaderConfig = getShaderConfig(game);
    if (!shaderConfig) {
        return [];
    }
    logGameAndShaderConfig(game, shaderConfig);
    return includeFolders.get(game)?.get(shaderConfig) ?? [];
}

function getGame(): string | undefined {
    const game = getConfiguration().launchOptions.game;
    return game ?? includeFolders.keys()?.next()?.value;
}

function getShaderConfig(game: string): string | undefined {
    const shaderConfigs = includeFolders.get(game);
    let shaderConfig = getShaderConfigBasedOnPlatform(shaderConfigs!);
    if (shaderConfig) {
        return shaderConfig;
    }
    shaderConfig = getShaderConfigBasedOnDriver(shaderConfigs!);
    if (shaderConfig) {
        return shaderConfig;
    }
    return shaderConfigs?.keys().next().value;
}

function getShaderConfigBasedOnPlatform(shaderConfigs: Map<ShaderConfig, string[]>): string | null {
    const platform = getConfiguration().launchOptions.platform;
    if (platform) {
        for (const shaderConfig of shaderConfigs.keys()) {
            if (shaderConfig.toLowerCase().includes(platform)) {
                return shaderConfig;
            }
        }
    }
    return null;
}

function getShaderConfigBasedOnDriver(shaderConfigs: Map<ShaderConfig, string[]>): string | null {
    const buildCommand = getConfiguration().launchOptions.buildCommand;
    if (buildCommand) {
        const driver = getDriver(buildCommand);
        if (driver) {
            for (const shaderConfig of shaderConfigs.keys()) {
                if (shaderConfig.toLowerCase().includes(driver.toLowerCase())) {
                    return shaderConfig;
                }
            }
        }
    }
    return null;
}

function getDriver(buildCommand: string): string | null {
    const shaderConfigFileRegex = /(?<=\.\/compile(_game)?_shaders_).*?(?=\.bat)/;
    const regexResult = shaderConfigFileRegex.exec(buildCommand);
    if (regexResult) {
        return buildCommand.substring(regexResult.index, regexResult.index + regexResult[0].length);
    }
    return null;
}

function logGameAndShaderConfig(game: string, shaderConfig: string): void {
    if (!logDocumentLinkResolveShaderConfig) {
        return;
    }
    log(`selected game: ${game}`);
    log(`selected shader config: ${shaderConfig}`);
}
