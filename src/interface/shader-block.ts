import { Range } from 'vscode-languageserver';
import { ElementRange } from './element-range';
import { HlslBlock } from './hlsl-block';

export interface ShaderBlock extends ElementRange {
    originalRange: Range;
    hlslBlocks: HlslBlock[];
}
