import { Range } from 'vscode-languageserver';
import { BlockDeclaration } from '../interface/block/block-declaration';
import { BlockUsage } from '../interface/block/block-usage';
import { FunctionDeclaration } from '../interface/function/function-declaration';
import { FunctionUsage } from '../interface/function/function-usage';
import { ShaderDeclaration } from '../interface/shader/shader-declaration';
import { ShaderUsage } from '../interface/shader/shader-usage';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';

export interface Scope {
    shaderDeclarations: ShaderDeclaration[];
    shaderUsages: ShaderUsage[];
    variableDeclarations: VariableDeclaration[];
    variableUsages: VariableUsage[];
    functionDeclarations: FunctionDeclaration[];
    functionUsages: FunctionUsage[];
    blockDeclaration?: BlockDeclaration;
    blockUsages: BlockUsage[];
    originalRange: Range;
    parent?: Scope;
    children: Scope[];
    isVisible: boolean;
}
