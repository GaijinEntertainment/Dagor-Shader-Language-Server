import { MacroDeclaration } from './macro-declaration';
import { MacroUsage } from './macro-usage';

export interface Macro {
    name: string;
    declarations: MacroDeclaration[];
    usages: MacroUsage[];
}

export function hasMacroDeclarationBefore(macro: Macro, position: number): boolean {
    return !!macro.declarations.length && macro.declarations.some((md) => md.position <= position);
}

export function getMacroDeclaration(macro: Macro, parameterCount: number, position: number): MacroDeclaration | null {
    return macro.declarations.find((md) => md.parameters.length === parameterCount && md.position <= position) ?? null;
}

export function isDeclarationAlreadyAdded(macro: Macro, md: MacroDeclaration): boolean {
    return macro.declarations.some(
        (md2) =>
            md2.uri === md.uri &&
            md2.originalRange.start.line === md.originalRange.start.line &&
            md2.originalRange.start.character === md.originalRange.start.character
    );
}
