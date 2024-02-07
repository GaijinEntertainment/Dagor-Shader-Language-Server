import { Range } from 'vscode-languageserver';
import { DefineStatement } from './define-statement';

export interface DefineContext {
    define: DefineStatement;
    startPosition: number;
    beforeEndPosition: number;
    afterEndPosition: number;
    nameOriginalRange: Range;
    isVisible: boolean;
    expansion: string;
}
