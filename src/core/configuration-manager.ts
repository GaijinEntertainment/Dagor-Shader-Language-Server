import { Connection, DidChangeConfigurationNotification } from 'vscode-languageserver';

import { Configuration } from '../interface/configuration';
import { Server } from '../server';
import { getCapabilities } from './capability-manager';
import { LAUNCH_OPTION_CURRENT_CONFIG } from './constant';

let configuration: Configuration = {
    launchOptions: {},
    shaderConfigOverride: '',
};
let connection: Connection;

export async function initializeConfiguration(serverConnection: Connection): Promise<void> {
    connection = serverConnection;
    await refreshConfiguration(true);
    if (getCapabilities().configurationChange) {
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    connection.onDidChangeConfiguration(async (_params) => {
        await refreshConfiguration();
    });
}

export function getConfiguration(): Configuration {
    return configuration;
}

async function refreshConfiguration(initial = false): Promise<void> {
    if (!getCapabilities().configuration) {
        return;
    }
    const oldConfiguration = configuration;
    const newConfiguration: Configuration = await connection.workspace.getConfiguration('dagorShaderLanguageServer');
    const newLaunchOptions = await connection.workspace.getConfiguration(LAUNCH_OPTION_CURRENT_CONFIG);
    newConfiguration.launchOptions = {};
    newConfiguration.launchOptions.buildCommand = newLaunchOptions?.Driver?.BuildCommand;
    const game = newLaunchOptions?.Game;
    if (game) {
        if (typeof game === 'string') {
            newConfiguration.launchOptions.game = game;
        } else if (typeof game === 'object') {
            newConfiguration.launchOptions.game = game.Name;
        }
    }
    newConfiguration.launchOptions.platform = newLaunchOptions?.Platform;
    configuration = newConfiguration;
    if (!initial) {
        await Server.getServer().configurationChanged(oldConfiguration, newConfiguration);
    }
}
