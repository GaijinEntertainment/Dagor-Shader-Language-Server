import {
    Connection,
    InitializedParams,
    ProposedFeatures,
    createConnection,
} from 'vscode-languageserver/node';

import { getConfiguration } from './core/configuration-manager';
import { clearCache } from './core/file-cache-manager';
import {
    exists,
    getFolderContent,
    isFile,
    loadFile,
    watchFile,
} from './helper/fs-helper';
import { Configuration } from './interface/configuration';
import { HostDependent } from './interface/host-dependent';
import {
    collectIncludeFolders,
    collectOverrideIncludeFolders,
} from './processor/include-processor';
import { Server } from './server';

export class ServerDesktop extends Server {
    protected override createConnection(): Connection {
        return createConnection(ProposedFeatures.all);
    }

    protected override createHostDependent(): HostDependent {
        return {
            documentLinkErrorMessage:
                "Couldn't find the file. Maybe you should change the launch options.",
            loadFile: loadFile,
            exists: exists,
            isFile: isFile,
            getFolderContent: getFolderContent,
            watchFile: watchFile,
        };
    }

    protected override async onInitialized(
        _ip: InitializedParams
    ): Promise<void> {
        await this.collectShaderIncludeFolders(
            getConfiguration().shaderConfigOverride
        );
    }

    protected override onShutdown(): void {
        clearCache();
    }

    public override async configurationChanged(
        oldConfiguration: Configuration,
        newConfiguration: Configuration
    ): Promise<void> {
        if (
            oldConfiguration.shaderConfigOverride !==
            newConfiguration.shaderConfigOverride
        ) {
            await this.collectShaderIncludeFolders(
                newConfiguration.shaderConfigOverride
            );
        }
    }

    private async collectShaderIncludeFolders(
        shaderConfigOverride: string
    ): Promise<void> {
        if (shaderConfigOverride) {
            await collectOverrideIncludeFolders();
        } else {
            await collectIncludeFolders();
        }
    }
}

new ServerDesktop();
