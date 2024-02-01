import { Position } from 'vscode-languageserver';
import { Snapshot } from '../../core/snapshot';
import { IncludeStatement } from './include-statement';

export interface IncludeContext {
    snapshot: Snapshot;
    startPosition: number;
    localStartPosition: number;
    endPosition: number;
    originalEndPosition: Position;
    includeStatement: IncludeStatement;
    parent: IncludeContext | null;
    children: IncludeContext[];
}
