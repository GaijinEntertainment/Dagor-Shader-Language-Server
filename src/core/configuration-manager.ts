import {
    Connection,
    DidChangeConfigurationNotification,
} from 'vscode-languageserver';

import { Server } from '../server';
import { getCapabilities } from './capability-manager';
import { Configuration } from './configuration';

let configuration: Configuration = {
    shaderConfigOverride: '',
};
let connection: Connection;

export async function initializeConfiguration(
    serverConnection: Connection
): Promise<void> {
    connection = serverConnection;
    await refreshConfiguration(true);
    if (getCapabilities().configurationChange) {
        connection.client.register(
            DidChangeConfigurationNotification.type,
            undefined
        );
    }
    connection.onDidChangeConfiguration(async (params) => {
        await refreshConfiguration();
    });
}

export function getConfiguration(): Configuration {
    return configuration;
}

export async function getExternalConfiguration<T = any>(
    name: string
): Promise<T | undefined> {
    if (!getCapabilities().configuration) {
        return undefined;
    }
    return connection.workspace.getConfiguration(name);
}

async function refreshConfiguration(initial = false): Promise<void> {
    if (!getCapabilities().configuration) {
        return;
    }
    const oldConfiguration = configuration;
    const newConfiguration = await connection.workspace.getConfiguration(
        'dagorShaderLanguageServer'
    );
    configuration = newConfiguration;
    if (!initial) {
        await Server.getServer().configurationChanged(
            oldConfiguration,
            newConfiguration
        );
    }
}
