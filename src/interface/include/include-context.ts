import { Snapshot } from '../../core/snapshot';

export interface IncludeContext {
    snapshot: Snapshot;
    startPosition: number;
    localStartPosition: number;
    endPosition: number;
    parent: IncludeContext | null;
    children: IncludeContext[];
}
