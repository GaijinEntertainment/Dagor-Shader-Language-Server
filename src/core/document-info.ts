import { TextDocument } from 'vscode-languageserver-textdocument';

import { preprocess } from '../processor/preprocessor';
import { Snapshot } from './snapshot';

export class DocumentInfo {
    private analyzedVersion = -1;
    private analyzationInProgressVersion = -1;
    private analyzationInProgress = Promise.resolve();
    private document: TextDocument;
    private snapshot = new Snapshot(-1, '', '');

    public constructor(document: TextDocument) {
        this.document = document;
    }

    public async getSnapshot(): Promise<Snapshot> {
        if (this.document.version <= this.analyzedVersion) {
            return this.snapshot;
        }
        if (this.document.version <= this.analyzationInProgressVersion) {
            await this.analyzationInProgress;
            return this.snapshot;
        }
        this.analyzationInProgress = this.analyze();
        await this.analyzationInProgress;
        return this.snapshot;
    }

    private async analyze(): Promise<void> {
        this.analyzationInProgressVersion = this.document.version;
        const snapshot = new Snapshot(
            this.document.version,
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
