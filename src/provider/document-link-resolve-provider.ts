import { CancellationToken, DocumentLink, Range } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { getExternalConfiguration } from '../core/configuration-manager';
import { log, logDocumentLinkResolveShaderConfig } from '../core/debug';
import { exists } from '../helper/fs-helper';
import { IncludeData } from '../helper/include-data';
import { showWarningMessage } from '../helper/server-helper';
import { includeFolders } from '../processor/include-processor';

import * as path from 'path';

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
    const originalFile = URI.parse(data.uri).fsPath;
    const includedFile = path.resolve(originalFile, '..', data.name);
    if (originalFile !== includedFile && (await exists(includedFile))) {
        return {
            range: range,
            target: URI.file(includedFile).toString(),
        };
    }
    return null;
}

async function getIncludeFileLink(
    range: Range,
    data: IncludeData
): Promise<DocumentLink | null> {
    const includeFolders = await getIncludeFolders();
    for (const includeFolder of includeFolders) {
        const includedFile = path.resolve(includeFolder, data.name);
        if (await exists(includedFile)) {
            return {
                range: range,
                target: URI.file(includedFile).toString(),
            };
        }
    }
    return null;
}

async function getIncludeFolders(): Promise<string[]> {
    if (!includeFolders.size) {
        return [];
    }
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
    const game = await getExternalConfiguration<string>(
        'launchOption.currentConfig.Game'
    );
    return game
        ? path.resolve('.', game)
        : includeFolders.keys()?.next()?.value;
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
    const platform = await getExternalConfiguration<string>(
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
    const buildCommand = await getExternalConfiguration<string>(
        'launchOption.currentConfig.Driver.BuildCommand'
    );
    if (buildCommand) {
        const shaderConfigFileRegex =
            /(?<=\.\/compile(_game)?_shaders_).*?(?=\.bat)/;
        const regexResult = shaderConfigFileRegex.exec(buildCommand);
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
    if (!logDocumentLinkResolveShaderConfig) {
        return;
    }
    log(`selected game: ${game}`);
    log(`selected shader config: ${shaderConfig}`);
}
