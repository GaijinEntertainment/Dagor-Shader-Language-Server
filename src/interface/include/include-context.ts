import { DocumentUri, Range } from 'vscode-languageserver';
import { Snapshot } from '../../core/snapshot';
import { IncludeStatement } from './include-statement';

export interface IncludeContext {
    snapshot: Snapshot;
    startPosition: number;
    localStartPosition: number;
    endPosition: number;
    originalRange: Range;
    includeStatement: IncludeStatement;
    parent: IncludeContext | null;
    children: IncludeContext[];
    uri: DocumentUri;
}
