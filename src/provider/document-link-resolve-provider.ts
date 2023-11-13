import { CancellationToken, DocumentLink, Range } from 'vscode-languageserver';
import { IncludeData } from '../helper/include-data';
import { includeFolders } from '../processor/include-processor';

import { URI } from 'vscode-uri';
import { exists } from '../helper/fs-helper';
import {
    getConfiguration,
    log,
    showWarningMessage,
} from '../helper/server-helper';

import * as path from 'path';

const logIncludeResolution = false;

export async function documentLinkResolveProvider(
    unresolvedLink: DocumentLink,
    token: CancellationToken
): Promise<DocumentLink | null> {
    const data: IncludeData = unresolvedLink.data;
    if (data.searchInLocalFolder) {
        const localFileLink = await getLocalFileLink(
            unresolvedLink.range,
            data
        );
        if (localFileLink) {
            return localFileLink;
        }
    }
    const includeFileLink = await getIncludeFileLink(
        unresolvedLink.range,
        data
    );
    if (includeFileLink) {
        return includeFileLink;
    }
    showWarningMessage(
        "Couldn't find the file. Maybe you should change the launch options."
    );
    return null;
}

async function getLocalFileLink(
    range: Range,
    data: IncludeData
): Promise<DocumentLink | null> {
    const filePath = path.resolve(URI.parse(data.uri).fsPath, '..', data.name);
    if (await exists(filePath)) {
        return {
            range: range,
            target: URI.file(filePath).toString(),
        };
    }
    return null;
}

async function getIncludeFileLink(
    range: Range,
    data: IncludeData
): Promise<DocumentLink | null> {
    const includePaths = await getIncludePaths();
    for (const includePath of includePaths) {
        const filePath = path.resolve(includePath, data.name);
        if (await exists(filePath)) {
            return {
                range: range,
                target: URI.file(filePath).toString(),
            };
        }
    }
    return null;
}

async function getIncludePaths(): Promise<string[]> {
    const game = await getGame();
    if (!game) {
        return [];
    }
    const shaderConfig = await getShaderConfig(game);
    if (!shaderConfig) {
        return [];
    }
    logGameAndShaderConfig(game, shaderConfig);
    return includeFolders.get(game)?.get(shaderConfig) ?? [];
}

async function getGame(): Promise<string | undefined> {
    const game: string | undefined = await getConfiguration(
        'launchOption.currentConfig.Game'
    );
    return game ?? includeFolders.keys()?.next()?.value;
}

async function getShaderConfig(game: string): Promise<string | undefined> {
    const shaderConfigs = includeFolders.get(game);
    let shaderConfig = await getShaderConfigBasedOnPlatform(shaderConfigs!);
    if (shaderConfig) {
        return shaderConfig;
    }
    shaderConfig = await getShaderConfigBasedOnDriver(shaderConfigs!);
    if (shaderConfig) {
        return shaderConfig;
    }
    return shaderConfigs?.keys().next().value;
}

async function getShaderConfigBasedOnPlatform(
    shaderConfigs: Map<string, string[]>
): Promise<string | null> {
    const platform: string | undefined = await getConfiguration(
        'launchOption.currentConfig.Platform'
    );
    if (platform) {
        for (const shaderConfig of shaderConfigs.keys()) {
            if (shaderConfig.toLowerCase().includes(platform)) {
                return shaderConfig;
            }
        }
    }
    return null;
}

async function getShaderConfigBasedOnDriver(
    shaderConfigs: Map<string, string[]>
): Promise<string | null> {
    const buildCommand: string | undefined = await getConfiguration(
        'launchOption.currentConfig.Driver.BuildCommand'
    );
    if (buildCommand) {
        const pattern = /(?<=\.\/compile(_game)?_shaders_).*?(?=\.bat)/g;
        const regexResult = pattern.exec(buildCommand);
        if (regexResult) {
            const driver = buildCommand.substring(
                regexResult.index,
                regexResult.index + regexResult[0].length
            );
            for (const shaderConfig of shaderConfigs.keys()) {
                if (shaderConfig.toLowerCase().includes(driver.toLowerCase())) {
                    return shaderConfig;
                }
            }
        }
    }
    return null;
}

function logGameAndShaderConfig(game: string, shaderConfig: string): void {
    if (!logIncludeResolution) {
        return;
    }
    log(`selected game: ${game}`);
    log(`selected shader config: ${shaderConfig}`);
}
