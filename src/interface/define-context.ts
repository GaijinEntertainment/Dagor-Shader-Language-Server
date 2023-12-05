import { DefineStatement } from './define-statement';

export interface DefineContext {
    define: DefineStatement;
    startPosition: number;
    endPosition: number;
    parent: DefineContext | null;
    children: DefineContext[];
}
