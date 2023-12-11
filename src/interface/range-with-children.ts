export interface RangeWithChildren {
    startPosition: number;
    endPosition: number;
    children: RangeWithChildren[];
}
