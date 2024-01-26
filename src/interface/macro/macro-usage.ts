import { Range } from 'vscode-languageserver';
import { Macro } from './macro';
import { MacroArgument } from './macro-argument';
import { MacroDeclaration } from './macro-declaration';

export interface MacroUsage {
    nameOriginalRange: Range;
    parameterListOriginalRange: Range;
    isVisible: boolean;
    arguments: MacroArgument[];
    macro: Macro;
    macroDeclaration: MacroDeclaration | null;
}

export function getBestMacroDeclarationIndex(mu: MacroUsage): number {
    let lowerClosest: number | null = null;
    let upperClosest: number | null = null;
    const mds = mu.macro.declarations;
    for (let i = 0; i < mds.length; i++) {
        const md = mu.macro.declarations[i];
        if (md.parameters.length === mu.arguments.length) {
            return i;
        }
        if (
            md.parameters.length < mu.arguments.length &&
            (lowerClosest === null || md.parameters.length > mds[lowerClosest].parameters.length)
        ) {
            lowerClosest = i;
        }
        if (
            md.parameters.length > mu.arguments.length &&
            (upperClosest === null || md.parameters.length < mds[upperClosest].parameters.length)
        ) {
            upperClosest = i;
        }
    }
    if (upperClosest !== null) {
        return upperClosest;
    } else if (lowerClosest !== null) {
        return lowerClosest;
    } else {
        return 0;
    }
}

export function getBestMacroDeclaration(mu: MacroUsage): MacroDeclaration | null {
    const mdi = getBestMacroDeclarationIndex(mu);
    if (mdi === null) {
        return null;
    }
    return mu.macro.declarations[mdi];
}
