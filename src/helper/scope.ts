import { Range } from 'vscode-languageserver';
import { FunctionDeclaration } from '../interface/function/function-declaration';
import { FunctionUsage } from '../interface/function/function-usage';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';

export interface Scope {
    variableDeclarations: VariableDeclaration[];
    variableUsages: VariableUsage[];
    functionDeclarations: FunctionDeclaration[];
    functionUsages: FunctionUsage[];
    originalRange: Range;
    parent?: Scope;
    children: Scope[];
}
