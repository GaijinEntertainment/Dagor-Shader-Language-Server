import { Position, SignatureHelp, SignatureHelpParams } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { toStringMacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroUsage, getBestMacroDeclarationIndex } from '../interface/macro/macro-usage';

export async function signatureHelpProvider(params: SignatureHelpParams): Promise<SignatureHelp | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const mu = snapshot.macroUsages.find(
        (mu) => mu.isVisible && rangeContains(mu.parameterListOriginalRange, params.position)
    );
    if (!mu || !mu.macro.declarations.length) {
        return null;
    }
    return {
        signatures: mu.macro.declarations.map((md) => ({
            label: toStringMacroDeclaration(md),
            parameters: md.parameters.map((mp) => ({
                label: mp.name,
            })),
        })),
        activeSignature: getActiveSignature(mu, params),
        activeParameter: getActiveParameter(mu, params.position),
    };
}

function getActiveParameter(mu: MacroUsage, position: Position): number | undefined {
    if (!getCapabilities().signatureHelpActiveParameter) {
        return undefined;
    }
    let activeParameter = mu.arguments.findIndex((ma) => rangeContains(ma.originalRange, position));
    if (activeParameter === -1) {
        activeParameter = mu.arguments.length;
    }
    return activeParameter;
}

function getActiveSignature(mu: MacroUsage, params: SignatureHelpParams): number {
    if (!getCapabilities().signatureHelpContext) {
        return 0;
    }
    const sh = params.context?.activeSignatureHelp;
    const activeSignature = sh?.activeSignature ?? 0;
    const activeParameterCount = sh?.signatures[activeSignature].parameters?.length ?? 0;
    if (mu.arguments.length <= activeParameterCount) {
        return activeSignature;
    }
    const si = getBestMacroDeclarationIndex(mu);
    return si === null ? activeSignature : si;
}
