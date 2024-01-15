import { DocumentVersion } from './document-version';

export interface SnapshotVersion {
    timestamp: number;
    documentVersion: number;
    includedDocumentsVersion: Map<string, DocumentVersion>;
    shaderConfigVersion: number;
}

export const invalidVersion: SnapshotVersion = {
    timestamp: -1,
    documentVersion: -1,
    includedDocumentsVersion: new Map<string, DocumentVersion>(),
    shaderConfigVersion: -1,
};
