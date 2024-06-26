import { EOL, platform } from 'os';
import { Connection, InitializedParams, ProposedFeatures, createConnection } from 'vscode-languageserver/node';

import { getConfiguration } from './core/configuration-manager';
import { clearCache } from './core/file-cache-manager';
import { exists, getFolderContent, isFile, loadFile, watchFile } from './helper/fs-helper';
import { Configuration } from './interface/configuration';
import { HostDependent } from './interface/host-dependent';
import {
    collectIncludeFolders,
    collectOverrideIncludeFolders,
    collectPredefines,
    increaseShaderConfigVersion,
} from './processor/include-processor';
import {
    clearDiagnostics,
    diagnosticsChangeOrCloseHandler,
    diagnosticsOpenOrSaveHandler,
} from './provider/diagnostic-provider';
import { Server } from './server';

export class ServerDesktop extends Server {
    protected override createConnection(): Connection {
        return createConnection(ProposedFeatures.all);
    }

    protected override createHostDependent(): HostDependent {
        return {
            loadFile: loadFile,
            exists: exists,
            isFile: isFile,
            getFolderContent: getFolderContent,
            watchFile: watchFile,
            getEol: () => EOL,
        };
    }

    protected override async onInitialized(_ip: InitializedParams): Promise<void> {
        await collectPredefines();
        await this.collectShaderIncludeFolders(getConfiguration().shaderConfigOverride);
    }

    protected override addFeatures(): void {
        super.addFeatures();
        if (platform() === 'win32') {
            this.documents.onDidOpen(diagnosticsOpenOrSaveHandler);
            this.documents.onDidChangeContent(diagnosticsChangeOrCloseHandler);
            this.documents.onDidSave(diagnosticsOpenOrSaveHandler);
            this.documents.onDidClose(diagnosticsChangeOrCloseHandler);
        }
    }

    protected override onShutdown(): void {
        clearCache();
    }

    public override async configurationChanged(
        oldConfiguration: Configuration,
        newConfiguration: Configuration
    ): Promise<void> {
        if (this.shaderConfigRelatedConfigurationChanged(oldConfiguration, newConfiguration)) {
            increaseShaderConfigVersion();
            if (oldConfiguration.shaderConfigOverride !== newConfiguration.shaderConfigOverride) {
                await this.collectShaderIncludeFolders(newConfiguration.shaderConfigOverride);
            }
            this.getDocuments()
                .all()
                .forEach((document) => {
                    clearDiagnostics(document);
                });
        }
    }

    private shaderConfigRelatedConfigurationChanged(
        oldConfiguration: Configuration,
        newConfiguration: Configuration
    ): boolean {
        return (
            oldConfiguration.shaderConfigOverride !== newConfiguration.shaderConfigOverride ||
            oldConfiguration.launchOptions.buildCommand !== newConfiguration.launchOptions.buildCommand ||
            oldConfiguration.launchOptions.game !== newConfiguration.launchOptions.game ||
            oldConfiguration.launchOptions.platform !== newConfiguration.launchOptions.platform
        );
    }

    private async collectShaderIncludeFolders(shaderConfigOverride: string): Promise<void> {
        if (shaderConfigOverride) {
            await collectOverrideIncludeFolders();
        } else {
            await collectIncludeFolders();
        }
    }
}

new ServerDesktop();
