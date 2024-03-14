import { Range } from 'vscode-languageserver';
import { BlockDeclaration } from './block-declaration';

export interface BlockUsage {
    originalRange: Range;
    declaration: BlockDeclaration;
    isVisible: boolean;
}
