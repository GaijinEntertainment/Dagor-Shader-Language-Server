import * as path from 'path';
import { DocumentUri } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import {
    getConfiguration,
    getExternalConfiguration,
} from '../core/configuration-manager';
import { LAUNCH_OPTION_CURRENT_CONFIG } from '../core/constant';
import { log, logDocumentLinkResolveShaderConfig } from '../core/debug';
import { exists, isFile } from '../helper/file-helper';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import {
    ShaderConfig,
    includeFolders,
    overrideIncludeFolders,
} from './include-processor';

export async function getIncludedDocumentUri(
    is: IncludeStatement | null
): Promise<DocumentUri | null> {
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

async function getRelativeDocumentUri(
    is: IncludeStatement
): Promise<DocumentUri | null> {
    const includerUri = URI.parse(is.includerUri).fsPath;
    const includedUri = path.join(includerUri, '..', is.path);
    if (
        includerUri !== includedUri &&
        (await exists(includedUri)) &&
        (await isFile(includedUri))
    ) {
        return URI.file(includedUri).toString();
    }
    return null;
}

async function getDocumentUriInIncludeFolder(
    is: IncludeStatement
): Promise<DocumentUri | null> {
    const includeFolders = await getIncludeFolders();
    for (const includeFolder of includeFolders) {
        const includedUri = path.join(includeFolder, is.path);
        if ((await exists(includedUri)) && (await isFile(includedUri))) {
            return URI.file(includedUri).toString();
        }
    }
    return null;
}

export async function getIncludeFolders(): Promise<string[]> {
    if (getConfiguration().shaderConfigOverride) {
        return overrideIncludeFolders;
    }
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
        `${LAUNCH_OPTION_CURRENT_CONFIG}.Game`
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
    shaderConfigs: Map<ShaderConfig, string[]>
): Promise<string | null> {
    const platform = await getExternalConfiguration<string>(
        `${LAUNCH_OPTION_CURRENT_CONFIG}.Platform`
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
    shaderConfigs: Map<ShaderConfig, string[]>
): Promise<string | null> {
    const buildCommand = await getExternalConfiguration<string>(
        `${LAUNCH_OPTION_CURRENT_CONFIG}.Driver.BuildCommand`
    );
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
    const shaderConfigFileRegex =
        /(?<=\.\/compile(_game)?_shaders_).*?(?=\.bat)/;
    const regexResult = shaderConfigFileRegex.exec(buildCommand);
    if (regexResult) {
        return buildCommand.substring(
            regexResult.index,
            regexResult.index + regexResult[0].length
        );
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
