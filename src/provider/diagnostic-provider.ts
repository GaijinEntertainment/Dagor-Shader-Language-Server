import { exec } from 'child_process';
import { EOL } from 'os';
import { Diagnostic, DiagnosticSeverity, Position, Range, TextDocumentChangeEvent } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import path = require('path');

import { getCapabilities } from '../core/capability-manager';
import { getConfiguration } from '../core/configuration-manager';
import { getRootFolder, sendDiagnostics } from '../helper/server-helper';

export class DiagnosticProvider {
    private document: TextDocument;
    private diagnostics: Diagnostic[] = [];

    public static async diagnosticOpenOrSaveHandler(event: TextDocumentChangeEvent<TextDocument>): Promise<void> {
        if (getCapabilities().diagnostics) {
            await new DiagnosticProvider(event.document).computeAndSendDiagnostics();
        }
    }

    public static diagnosticChangeOrCloseHandler(event: TextDocumentChangeEvent<TextDocument>): void {
        if (getCapabilities().diagnostics) {
            new DiagnosticProvider(event.document).clearDiagnostics();
        }
    }

    private static sendDiagnostics(document: TextDocument, diagnostics: Diagnostic[]): void {
        sendDiagnostics({
            uri: document.uri,
            version: document.version,
            diagnostics,
        });
    }

    private constructor(document: TextDocument) {
        this.document = document;
    }

    private async computeAndSendDiagnostics(): Promise<void> {
        if (this.document.uri.endsWith('.dshl')) {
            await this.validateDocument();
        }
    }

    private clearDiagnostics(): void {
        DiagnosticProvider.sendDiagnostics(this.document, []);
    }

    private async validateDocument(): Promise<void> {
        const validatorOutput = await this.getCompilerOutput();
        console.log(validatorOutput);
        this.addDiagnosticsAndSend(validatorOutput);
    }

    private async getCompilerOutput(): Promise<string> {
        return new Promise<string>((resolve) => {
            // TODO: check if compiler exists
            const compilerPath = this.getCompilerPath();
            // TODO: select blk file
            const blkPath = 'D:/dagor2/enlisted/prog/shaders/shaders_dx12.blk';
            // TODO: check if path is correct if it's not in the shaders folder
            const dshlPath = path.parse(this.document.uri).base;
            exec(
                `${compilerPath} ${blkPath} -c ${dshlPath} -nosave -w -wx -wall -supressLogs`,
                {
                    // TODO: select the correct shaders folder
                    cwd: 'D:/dagor2/enlisted/prog/shaders',
                },
                (_, validatorOutput) => {
                    resolve(validatorOutput);
                }
            );
        });
    }

    // public async collectIncludeFolders(): Promise<void> {
    //     const gameFolders = await this.getGameFolders();
    //     for (const gameFolder of gameFolders) {
    //         await this.addIncludeFolders(gameFolder);
    //     }
    // }

    // private async getGameFolders(): Promise<string[]> {
    //     let result = await this.getFoldersFrom('.');
    //     const absoluteSamplesPath = path.resolve(getRootFolder(), 'samples');
    //     if (await exists(absoluteSamplesPath)) {
    //         const samples = await this.getFoldersFrom('samples');
    //         result = result.concat(samples);
    //     }
    //     return result;
    // }

    // private async getFoldersFrom(pathFrom: string): Promise<string[]> {
    //     const absolutePath = path.resolve(getRootFolder(), pathFrom);
    //     const filesAndFolders = await getFolderContent(absolutePath);
    //     const folders = filesAndFolders.filter((item) => item.isDirectory());
    //     return folders.map((item) => path.join(pathFrom, item.name));
    // }

    // private async addIncludeFolders(gameFolder: string): Promise<void> {
    //     const shadersFolder = path.resolve(getRootFolder(), gameFolder, 'prog/shaders');
    //     if (await exists(shadersFolder)) {
    //         const shaderConfigs = await this.getShaderConfigs(shadersFolder);
    //         for (const shaderConfig of shaderConfigs) {
    //             const shaderConfigPath = path.join(shadersFolder, shaderConfig);
    //             // TODO
    //         }
    //     }
    // }

    // private async getShaderConfigs(shadersFolder: string): Promise<string[]> {
    //     const filesAndFolders = await getFolderContent(shadersFolder);
    //     const shaderConfigs = filesAndFolders.filter(
    //         (item) => item.isFile() && item.name.startsWith('shaders_') && item.name.endsWith('.blk')
    //     );
    //     return shaderConfigs.map((item) => item.name);
    // }

    private getCompilerPath(): string {
        return `${getRootFolder()}/tools/dagor3_cdk/util64/${this.getCompilerName()}`;
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

    private addDiagnosticsAndSend(compilerOutput: string): void {
        const compilerOutputRows = compilerOutput.split(EOL);
        for (const compilerOutputRow of compilerOutputRows) {
            this.addDiagnosticForRow(compilerOutputRow.trim());
        }
        DiagnosticProvider.sendDiagnostics(this.document, this.diagnostics);
    }

    private addDiagnosticForRow(compilerOutputRow: string): void {
        if (
            compilerOutputRow.includes('[FATAL ERROR]') ||
            compilerOutputRow.includes('[ERROR]') ||
            compilerOutputRow.includes('[WARN]')
        ) {
            const regex = /\[(?<severity>\w+)\] [^()]*\((?<line>\d+),(?<column>\d+)\): \w+: (?<description>.*)/;
            const regexResult = regex.exec(compilerOutputRow);
            if (regexResult?.groups) {
                const validatorSeverity = regexResult.groups['severity'];
                const line = +regexResult.groups['line'] - 1;
                // TODO: snippet
                const snippet: string | undefined = undefined; //regexResult.groups['snippet'];
                const description = regexResult.groups['description'];
                this.addDiagnostic(validatorSeverity, line, snippet, description);
            } else {
                // TODO: show full message in the 1st line
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
            message: this.getMessage(description, snippet),
            severity: this.getSeverity(validatorSeverity),
            source: 'Dagor Shader Compiler',
        };
        this.diagnostics.push(diagnostic);
    }

    private getRange(line: number, snippet: string | undefined): Range {
        const rowRange: Range = { start: { line, character: 0 }, end: { line: line + 1, character: 0 } };
        const row = this.document.getText(rowRange);
        // TODO
        // if (snippet && !this.configuration.diagnostics.markTheWholeLine) {
        //     const position = row.indexOf(snippet);
        //     if (position !== -1) {
        //         return Range.create(Position.create(line, position), Position.create(line, position + snippet.length));
        //     }
        // }
        return this.getTrimmedRange(line, row);
    }

    private getTrimmedRange(line: number, row: string): Range {
        const trimmedRow = row.trim();
        const start: Position = { line, character: row.indexOf(trimmedRow) };
        const end: Position = { line, character: start.character + trimmedRow.length };
        return { start, end };
    }

    private getMessage(description: string, snippet: string | undefined): string {
        return snippet ? `'${snippet}' : ${description}` : description;
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
