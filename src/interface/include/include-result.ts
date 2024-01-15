import { Snapshot } from '../../core/snapshot';
import { IncludeStatement } from './include-statement';

export interface IncludeResult {
    snapshot: Snapshot;
    position: number;
    beforeEndPosition: number;
    includeStatement: IncludeStatement;
}
