import { TextDocument } from 'vscode-languageserver-textdocument';

import { URI } from 'vscode-uri';
import { getDocuments, syncInitialization } from '../helper/server-helper';
import { DocumentVersion } from '../interface/document-version';
import { SnapshotVersion, invalidVersion } from '../interface/snapshot-version';
import {
    getShaderConfigVersion,
    syncIncludeFoldersCollection,
} from '../processor/include-processor';
import { preprocess } from '../processor/preprocessor';
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
        for (const [
            uri,
            includedDocumentVersion,
        ] of version.includedDocumentsVersion.entries()) {
            const document = getDocuments().get(uri);
            if (document) {
                if (
                    document.version > includedDocumentVersion.version ||
                    !includedDocumentVersion.isManaged
                ) {
                    return false;
                }
            } else {
                const cachedVersion = getFileVersion(URI.parse(uri).fsPath);
                if (
                    cachedVersion > includedDocumentVersion.version ||
                    includedDocumentVersion.isManaged
                ) {
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
            timestamp: performance.now(),
            documentVersion: this.document.version,
            includedDocumentsVersion,
            shaderConfigVersion: getShaderConfigVersion(),
        };
        await syncInitialization();
        await syncIncludeFoldersCollection();
        const snapshot = new Snapshot(
            this.analyzationInProgressVersion,
            this.document.uri,
            this.document.getText()
        );
        await preprocess(snapshot);
        if (this.analyzedVersion <= snapshot.version) {
            this.analyzedVersion = snapshot.version;
            this.snapshot = snapshot;
        }
    }
}
