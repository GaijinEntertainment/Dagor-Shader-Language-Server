import { DefineStatement } from './define-statement';

export interface DefineContext {
    define: DefineStatement;
    startPosition: number;
    beforeEndPosition: number;
    afterEndPosition: number;
    result: string;
    parent: DefineContext | null;
    children: DefineContext[];
}
