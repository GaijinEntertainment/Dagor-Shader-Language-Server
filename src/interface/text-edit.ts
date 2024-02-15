import { ElementRange } from './element-range';

export interface TextEdit extends ElementRange {
    newText: string;
}
