import { Snapshot } from '../../core/snapshot';

export interface IncludeResult {
    snapshot: Snapshot;
    position: number;
    beforeEndPosition: number;
}
