import { exec } from 'child_process';
import { EOL } from 'os';
import * as path from 'path';
import { Diagnostic, DiagnosticSeverity, Position, Range, TextDocumentChangeEvent } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { getCapabilities } from '../core/capability-manager';
import { getConfiguration } from '../core/configuration-manager';
import { exists, getFolderContent } from '../helper/file-helper';
import { getRootFolder, sendDiagnostics } from '../helper/server-helper';

export async function diagnosticOpenOrSaveHandler(event: TextDocumentChangeEvent<TextDocument>): Promise<void> {
    if (getCapabilities().diagnostics) {
        await new DiagnosticProvider(event.document).computeAndSendDiagnostics();
    }
}

export function diagnosticChangeOrCloseHandler(event: TextDocumentChangeEvent<TextDocument>): void {
    if (getCapabilities().diagnostics) {
        new DiagnosticProvider(event.document).clearDiagnostics();
    }
}

class DiagnosticProvider {
    private document: TextDocument;
    private diagnostics: Diagnostic[] = [];
    private shaderConfigs: string[] = [];

    public constructor(document: TextDocument) {
        this.document = document;
    }

    public async computeAndSendDiagnostics(): Promise<void> {
        if (this.document.uri.endsWith('.dshl')) {
            await this.validateDocument();
        }
    }

    public clearDiagnostics(): void {
        sendDiagnostics({
            uri: this.document.uri,
            version: this.document.version,
            diagnostics: [],
        });
    }

    private async validateDocument(): Promise<void> {
        const compilerPath = this.getCompilerPath();
        if (!(await exists(compilerPath))) {
            return;
        }
        const blkPath = await this.getBlkPath();
        const SHADERS = 'shaders';
        let shadersIndex = blkPath.indexOf(SHADERS);
        if (shadersIndex === -1) {
            return;
        }
        const workingDirectory = blkPath.substring(0, shadersIndex + SHADERS.length);
        shadersIndex = this.document.uri.indexOf(SHADERS);
        if (shadersIndex === -1) {
            return;
        }
        const dshlPath = this.document.uri.substring(shadersIndex + SHADERS.length + 1);
        const validatorOutput = await this.getCompilerOutput(compilerPath, blkPath, dshlPath, workingDirectory);
        console.log(validatorOutput);
        this.addDiagnosticsAndSend(validatorOutput);
    }

    private async getCompilerOutput(
        compilerPath: string,
        blkPath: string,
        dshlPath: string,
        workingDirectory: string
    ): Promise<string> {
        return new Promise<string>((resolve) => {
            exec(
                `${compilerPath} ${blkPath} -c ${dshlPath} -nosave -w -wx -wall -supressLogs`,
                {
                    cwd: workingDirectory,
                },
                (_, validatorOutput) => {
                    resolve(validatorOutput);
                }
            );
        });
    }

    private getCompilerPath(): string {
        return path.resolve(getRootFolder(), 'tools/dagor3_cdk/util64', `${this.getCompilerName()}.exe`);
    }

    private getCompilerName(): string | null {
        const platform = getConfiguration().launchOptions.platform;
        const buildCommand = getConfiguration().launchOptions.buildCommand;
        if (buildCommand?.includes('dx12')) {
            return 'dsc2-dx12-dev';
        } else if (buildCommand?.includes('pc11')) {
            return 'dsc2-hlsl11-dev';
        } else if (platform === 'ps4') {
            return 'dsc2-ps4-dev';
        } else if (platform === 'ps5') {
            return 'dsc2-ps5-dev';
        } else if (buildCommand?.includes('spirv')) {
            return 'dsc2-spirv-dev';
        } else {
            return 'dsc2-dx12-dev';
        }
    }

    private async getBlkPath(): Promise<string> {
        if (getConfiguration().shaderConfigOverride) {
            return path.resolve(getRootFolder(), getConfiguration().shaderConfigOverride);
        } else {
            await this.collectShaderConfig();
            const game = getConfiguration().launchOptions.game ?? '';
            const platform = getConfiguration().launchOptions.platform ?? '';
            const buildCommand = getConfiguration().launchOptions.buildCommand ?? null;
            let shaderConfig = this.shaderConfigs.find((sc) => sc.includes(game) && sc.includes(platform));
            if (shaderConfig) {
                return shaderConfig;
            }
            if (buildCommand) {
                const driver = buildCommand.substring(buildCommand.lastIndexOf('_') + 1, buildCommand.lastIndexOf('.'));
                shaderConfig = this.shaderConfigs.find((sc) => sc.includes(game) && sc.includes(driver));
                if (shaderConfig) {
                    return shaderConfig;
                }
            }
            shaderConfig = this.shaderConfigs.find((sc) => sc.includes(game) && sc.includes('dx12'));
            if (shaderConfig) {
                return shaderConfig;
            }
            return this.shaderConfigs[0];
        }
    }

    public async collectShaderConfig(): Promise<void> {
        const gameFolders = await this.getGameFolders();
        for (const gameFolder of gameFolders) {
            await this.collectShaderConfigFromGameFolder(gameFolder);
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

    private async collectShaderConfigFromGameFolder(gameFolder: string): Promise<void> {
        const shadersFolder = path.resolve(getRootFolder(), gameFolder, 'prog/shaders');
        if (await exists(shadersFolder)) {
            const shaderConfigs = await this.getShaderConfigs(shadersFolder);
            for (const shaderConfig of shaderConfigs) {
                const shaderConfigPath = path.join(shadersFolder, shaderConfig);
                this.shaderConfigs.push(shaderConfigPath);
            }
        }
    }

    private async getShaderConfigs(shadersFolder: string): Promise<string[]> {
        const filesAndFolders = await getFolderContent(shadersFolder);
        const shaderConfigs = filesAndFolders.filter(
            (item) => item.isFile() && item.name.startsWith('shaders_') && item.name.endsWith('.blk')
        );
        return shaderConfigs.map((item) => item.name);
    }

    private addDiagnosticsAndSend(compilerOutput: string): void {
        const compilerOutputRows = compilerOutput.split(EOL);
        for (const compilerOutputRow of compilerOutputRows) {
            this.addDiagnosticForRow(compilerOutputRow.trim());
        }
        sendDiagnostics({
            uri: this.document.uri,
            version: this.document.version,
            diagnostics: this.diagnostics,
        });
    }

    private addDiagnosticForRow(compilerOutputRow: string): void {
        if (
            compilerOutputRow.includes('[FATAL ERROR]') ||
            compilerOutputRow.includes('[ERROR]') ||
            compilerOutputRow.includes('[WARN]')
        ) {
            const regex =
                /\[(?<severity>\w+)\] [^()]*\((?<line>\d+),(?<column>\d+)\): \w+: (?<description>[^<>]*(<(?<snippet>[^<>]*)>)?)/;
            const regexResult = regex.exec(compilerOutputRow);
            if (regexResult?.groups) {
                const validatorSeverity = regexResult.groups['severity'];
                const line = +regexResult.groups['line'] - 1;
                const snippet: string | undefined = regexResult.groups['snippet'];
                const description = regexResult.groups['description'];
                this.addDiagnostic(validatorSeverity, line, snippet, description);
            }
        }
    }

    private addDiagnostic(
        validatorSeverity: string,
        line: number,
        snippet: string | undefined,
        description: string
    ): void {
        const diagnostic: Diagnostic = {
            range: this.getRange(line, snippet),
            message: description,
            severity: this.getSeverity(validatorSeverity),
            source: 'Dagor Shader Compiler',
        };
        this.diagnostics.push(diagnostic);
    }

    private getRange(line: number, snippet: string | undefined): Range {
        const rowRange: Range = { start: { line, character: 0 }, end: { line: line + 1, character: 0 } };
        const row = this.document.getText(rowRange);
        if (snippet) {
            const position = row.indexOf(snippet);
            if (position !== -1) {
                return { start: { line, character: position }, end: { line, character: position + snippet.length } };
            }
        }
        return this.getTrimmedRange(line, row);
    }

    private getTrimmedRange(line: number, row: string): Range {
        const trimmedRow = row.trim();
        const start: Position = { line, character: row.indexOf(trimmedRow) };
        const end: Position = { line, character: start.character + trimmedRow.length };
        return { start, end };
    }

    private getSeverity(validatorSeverity: string): DiagnosticSeverity | undefined {
        if (validatorSeverity.includes('ERROR')) {
            return DiagnosticSeverity.Error;
        } else if (validatorSeverity.includes('WARN')) {
            return DiagnosticSeverity.Warning;
        } else {
            return undefined;
        }
    }
}
