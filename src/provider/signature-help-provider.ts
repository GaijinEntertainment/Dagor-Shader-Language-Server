import { Position, SignatureHelp, SignatureHelpParams } from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { toStringFunctionDeclaration } from '../interface/function/function-declaration';
import { toStringFunctionParameter } from '../interface/function/function-parameter';
import { FunctionUsage } from '../interface/function/function-usage';
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
    if (mu?.macro.declarations.length) {
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

    const fu = snapshot.getFunctionUsageParameterListAt(params.position);
    if (fu && fu.declaration) {
        const fd = fu.declaration;
        return {
            signatures: [
                {
                    label: toStringFunctionDeclaration(fd),
                    parameters: fd.parameters.map((fp) => ({
                        label: toStringFunctionParameter(fp),
                    })),
                },
            ],
            activeSignature: 0,
            activeParameter: getActiveParameter(fu, params.position),
        };
    }

    return null;
}

function getActiveParameter(usage: MacroUsage | FunctionUsage, position: Position): number | undefined {
    if (!getCapabilities().signatureHelpActiveParameter) {
        return undefined;
    }
    let activeParameter = usage.arguments.findIndex((ma) => rangeContains(ma.originalRange, position));
    if (activeParameter === -1) {
        activeParameter = usage.arguments.length;
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
