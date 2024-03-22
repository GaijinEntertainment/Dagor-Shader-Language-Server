import { TextDocument } from 'vscode-languageserver-textdocument';

import { CommonTokenStream } from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { URI } from 'vscode-uri';
import { DshlLexer } from '../_generated/DshlLexer';
import { DshlParser } from '../_generated/DshlParser';
import { createLexer, offsetPosition } from '../helper/helper';
import { Scope } from '../helper/scope';
import { getDocuments, syncInitialization } from '../helper/server-helper';
import { DocumentVersion } from '../interface/document-version';
import { MacroDeclaration } from '../interface/macro/macro-declaration';
import { SnapshotVersion, invalidVersion } from '../interface/snapshot-version';
import { DshlVisitor } from '../processor/dshl-visitor';
import { getShaderConfigVersion, syncIncludeFoldersCollection } from '../processor/include-processor';
import { preprocess } from '../processor/preprocessor';
import { HLSLI_EXTENSION, HLSL_EXTENSION } from './constant';
import { getFileVersion } from './file-cache-manager';
import { Snapshot } from './snapshot';

export class DocumentInfo {
    private analyzedVersion = invalidVersion;
    private analyzationInProgressVersion = invalidVersion;
    private analyzationInProgress = Promise.resolve();
    private lastTimeClosed = 0;
    private document: TextDocument;
    private snapshot = new Snapshot(invalidVersion, '', '');

    public constructor(document: TextDocument) {
        this.document = document;
    }

    public async getSnapshot(): Promise<Snapshot> {
        if (this.isAnalyzedVersionValid()) {
            return this.snapshot;
        }
        if (this.isAnalyzationInProgressVersionValid()) {
            await this.analyzationInProgress;
            return this.snapshot;
        }
        this.analyzationInProgress = this.analyze();
        await this.analyzationInProgress;
        return this.snapshot;
    }

    private isAnalyzedVersionValid(): boolean {
        return this.isVersionValid(this.analyzedVersion) && this.analyzedVersion.timestamp > this.lastTimeClosed;
    }

    private isAnalyzationInProgressVersionValid(): boolean {
        return this.isVersionValid(this.analyzationInProgressVersion);
    }

    private isVersionValid(version: SnapshotVersion): boolean {
        if (this.document.version > version.documentVersion) {
            return false;
        }
        if (getShaderConfigVersion() > version.shaderConfigVersion) {
            return false;
        }
        for (const [uri, includedDocumentVersion] of version.includedDocumentsVersion.entries()) {
            const document = getDocuments().get(uri);
            if (document) {
                if (
                    document.version > includedDocumentVersion.version ||
                    (!includedDocumentVersion.isManaged &&
                        (document.version !== 1 ||
                            includedDocumentVersion.version !== getFileVersion(URI.parse(uri).fsPath)))
                ) {
                    return false;
                }
            } else {
                const cachedVersion = getFileVersion(URI.parse(uri).fsPath);
                if (cachedVersion > includedDocumentVersion.version) {
                    return false;
                }
            }
        }
        return true;
    }

    private async analyze(): Promise<void> {
        const includedDocumentsVersion = new Map<string, DocumentVersion>();
        for (const uri of this.analyzedVersion.includedDocumentsVersion.keys()) {
            const document = getDocuments().get(uri);
            if (document) {
                includedDocumentsVersion.set(uri, {
                    version: document.version,
                    isManaged: true,
                });
            } else {
                const cachedVersion = getFileVersion(URI.parse(uri).fsPath);
                includedDocumentsVersion.set(uri, {
                    version: cachedVersion,
                    isManaged: false,
                });
            }
        }
        this.analyzationInProgressVersion = {
            timestamp: Date.now(),
            documentVersion: this.document.version,
            includedDocumentsVersion,
            shaderConfigVersion: getShaderConfigVersion(),
        };
        await syncInitialization();
        await syncIncludeFoldersCollection();
        const snapshot = new Snapshot(this.analyzationInProgressVersion, this.document.uri, this.document.getText());
        await preprocess(snapshot);
        this.analyzeSnapshot(snapshot);
        if (this.analyzedVersion <= snapshot.version) {
            this.analyzedVersion = snapshot.version;
            this.snapshot = snapshot;
            // sendDiagnostics({ uri: snapshot.uri, diagnostics: snapshot.diagnostics });
        }
    }

    private analyzeSnapshot(snapshot: Snapshot): void {
        const lexer = createLexer(snapshot.text);
        const parser = this.createParser(lexer);
        let tree: ParseTree;
        try {
            if (this.document.uri.endsWith(HLSL_EXTENSION) || this.document.uri.endsWith(HLSLI_EXTENSION)) {
                tree = parser.hlsl();
            } else {
                tree = parser.dshl();
            }
            const visitor = new DshlVisitor(snapshot);
            visitor.visit(tree);
        } catch (e) {
            // catching any error during the parsing to prevent the server from crashing
        }
        this.addMacroDefinitions(snapshot);
    }

    private addMacroDefinitions(snapshot: Snapshot): void {
        if (!this.document.uri.endsWith(HLSL_EXTENSION) && !this.document.uri.endsWith(HLSLI_EXTENSION)) {
            for (const md of snapshot.macroDeclarations.filter((md) => md.uri === snapshot.uri)) {
                try {
                    const contentSnapshot = md.contentSnapshot;
                    const lexer = createLexer(contentSnapshot.text);
                    const parser = this.createParser(lexer);
                    const tree = parser.dshl();
                    const visitor = new DshlVisitor(contentSnapshot, snapshot, md.contentOriginalRange.start);
                    visitor.visit(tree);
                    for (const fr of contentSnapshot.foldingRanges) {
                        offsetPosition(fr.start, md.contentOriginalRange.start);
                        offsetPosition(fr.end, md.contentOriginalRange.start);
                        snapshot.foldingRanges.push(fr);
                    }
                    const macroScope: Scope = {
                        originalRange: contentSnapshot.rootScope.originalRange,
                        children: [contentSnapshot.rootScope],
                        shaderDeclarations: [],
                        shaderUsages: [],
                        variableDeclarations: [],
                        variableUsages: [],
                        functionUsages: [],
                        blockUsages: [],
                        macroDeclaration: md,
                        functionDeclarations: [],
                        parent: snapshot.rootScope,
                        isVisible: contentSnapshot.rootScope.isVisible,
                    };
                    contentSnapshot.rootScope.parent = macroScope;
                    this.addElementsFromMacro(contentSnapshot.rootScope, md, true);
                    snapshot.rootScope.children.push(macroScope);
                } catch (e) {
                    // catching any error during the parsing to prevent the server from crashing
                }
            }
        }
    }

    private addElementsFromMacro(scope: Scope, md: MacroDeclaration, root: boolean): void {
        if (root) {
            scope.macroDeclaration = md;
        }
        offsetPosition(scope.originalRange.start, md.contentOriginalRange.start);
        offsetPosition(scope.originalRange.end, md.contentOriginalRange.start);
        for (const sd of scope.shaderDeclarations) {
            offsetPosition(sd.originalRange.start, md.contentOriginalRange.start);
            offsetPosition(sd.originalRange.end, md.contentOriginalRange.start);
            offsetPosition(sd.nameOriginalRange.start, md.contentOriginalRange.start);
            offsetPosition(sd.nameOriginalRange.end, md.contentOriginalRange.start);
        }
        for (const su of scope.shaderUsages) {
            offsetPosition(su.originalRange.start, md.contentOriginalRange.start);
            offsetPosition(su.originalRange.end, md.contentOriginalRange.start);
        }
        for (const vd of scope.variableDeclarations) {
            offsetPosition(vd.originalRange.start, md.contentOriginalRange.start);
            offsetPosition(vd.originalRange.end, md.contentOriginalRange.start);
            offsetPosition(vd.nameOriginalRange.start, md.contentOriginalRange.start);
            offsetPosition(vd.nameOriginalRange.end, md.contentOriginalRange.start);
            if (vd.interval) {
                offsetPosition(vd.interval.nameOriginalRange.start, md.contentOriginalRange.start);
                offsetPosition(vd.interval.nameOriginalRange.end, md.contentOriginalRange.start);
            }
        }
        for (const vu of scope.variableUsages) {
            offsetPosition(vu.originalRange.start, md.contentOriginalRange.start);
            offsetPosition(vu.originalRange.end, md.contentOriginalRange.start);
        }
        for (const fu of scope.functionUsages) {
            offsetPosition(fu.originalRange.start, md.contentOriginalRange.start);
            offsetPosition(fu.originalRange.end, md.contentOriginalRange.start);
            offsetPosition(fu.nameOriginalRange.start, md.contentOriginalRange.start);
            offsetPosition(fu.nameOriginalRange.end, md.contentOriginalRange.start);
            offsetPosition(fu.parameterListOriginalRange.start, md.contentOriginalRange.start);
            offsetPosition(fu.parameterListOriginalRange.end, md.contentOriginalRange.start);
            for (const fa of fu.arguments) {
                offsetPosition(fa.originalRange.start, md.contentOriginalRange.start);
                offsetPosition(fa.originalRange.end, md.contentOriginalRange.start);
                offsetPosition(fa.trimmedOriginalStartPosition, md.contentOriginalRange.start);
            }
        }
        if (scope.blockDeclaration) {
            offsetPosition(scope.blockDeclaration.originalRange.start, md.contentOriginalRange.start);
            offsetPosition(scope.blockDeclaration.originalRange.end, md.contentOriginalRange.start);
        }
        for (const bu of scope.blockUsages) {
            offsetPosition(bu.originalRange.start, md.contentOriginalRange.start);
            offsetPosition(bu.originalRange.end, md.contentOriginalRange.start);
        }
        for (const child of scope.children) {
            this.addElementsFromMacro(child, md, false);
        }
    }

    private createParser(lexer: DshlLexer): DshlParser {
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new DshlParser(tokenStream);
        parser.removeErrorListeners();
        return parser;
    }

    public opened(document: TextDocument): void {
        this.document = document;
        if (document.version < this.analyzedVersion.documentVersion) {
            this.analyzedVersion = invalidVersion;
            this.analyzationInProgressVersion = invalidVersion;
            this.analyzationInProgress = Promise.resolve();
        }
        // sendDiagnostics({ uri: this.document.uri, diagnostics: this.snapshot.diagnostics });
    }

    public closed(): void {
        this.lastTimeClosed = Date.now();
        // sendDiagnostics({ uri: this.document.uri, diagnostics: [] });
    }
}
