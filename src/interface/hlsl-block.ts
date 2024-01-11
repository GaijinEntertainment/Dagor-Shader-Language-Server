import { Range } from 'vscode-languageserver';

import { ElementRange } from './element-range';
import { ShaderStage } from './shader-stage';

export interface HlslBlock extends ElementRange {
    originalRange: Range;
    isNotVisible: boolean;
    stage?: ShaderStage | null;
}
