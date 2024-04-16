import { Range } from 'vscode-languageserver';
import { BlockDeclaration } from '../interface/block/block-declaration';
import { BlockUsage } from '../interface/block/block-usage';
import { FunctionDeclaration } from '../interface/function/function-declaration';
import { FunctionUsage } from '../interface/function/function-usage';
import { MacroDeclaration } from '../interface/macro/macro-declaration';
import { ShaderStage } from '../interface/shader-stage';
import { ShaderDeclaration } from '../interface/shader/shader-declaration';
import { ShaderUsage } from '../interface/shader/shader-usage';
import { TypeDeclaration } from '../interface/type/type-declaration';
import { TypeUsage } from '../interface/type/type-usage';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';

export interface Scope {
    shaderDeclarations: ShaderDeclaration[];
    shaderUsages: ShaderUsage[];
    typeDeclarations: TypeDeclaration[];
    typeUsages: TypeUsage[];
    variableDeclarations: VariableDeclaration[];
    variableUsages: VariableUsage[];
    functionDeclarations: FunctionDeclaration[];
    functionUsages: FunctionUsage[];
    blockDeclaration?: BlockDeclaration;
    blockUsages: BlockUsage[];
    macroDeclaration?: MacroDeclaration;
    originalRange: Range;
    parent?: Scope;
    children: Scope[];
    isVisible: boolean;

    hlslBlocks: Scope[];
    hlslStage?: ShaderStage | null;
    preshaders: Scope[];
    preshaderStage?: ShaderStage | null;
}
