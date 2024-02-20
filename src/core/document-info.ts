import { TextDocument } from 'vscode-languageserver-textdocument';

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { URI } from 'vscode-uri';
import { DshlLexer } from '../_generated/DshlLexer';
import { DshlParser } from '../_generated/DshlParser';
import { getDocuments, syncInitialization } from '../helper/server-helper';
import { DocumentVersion } from '../interface/document-version';
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
        return this.isVersionValid(this.analyzedVersion);
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
        }
    }

    private analyzeSnapshot(snapshot: Snapshot): void {
        if (this.document.uri.endsWith(HLSL_EXTENSION) || this.document.uri.endsWith(HLSLI_EXTENSION)) {
            const lexer = this.createLexer(snapshot.text);
            const parser = this.createParser(lexer);
            const tree = parser.hlsl();
            const visitor = new DshlVisitor(snapshot);
            visitor.visit(tree);
        }
    }

    private createLexer(text: string): DshlLexer {
        //The ANTLRInputStream class is deprecated, however as far as I know this is the only way the TypeScript version of ANTLR accepts UTF-16 strings.
        //The CharStreams.fromString method only accepts UTF-8 and other methods of the CharStreams class are not implemented in TypeScript.
        const charStream = new ANTLRInputStream(text);
        const lexer = new DshlLexer(charStream);
        return lexer;
    }

    private createParser(lexer: DshlLexer): DshlParser {
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new DshlParser(tokenStream);
        parser.removeErrorListeners();
        return parser;
    }
}
