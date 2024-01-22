import { SignatureHelp, SignatureHelpParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { rangeContains } from '../helper/helper';
import { toStringMacroStatement } from '../interface/macro/macro-statement';

export async function signatureHelpProvider(params: SignatureHelpParams): Promise<SignatureHelp | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const pmc = snapshot.potentialMacroContexts.find(
        (pmc) => pmc.isVisible && rangeContains(pmc.parameterListOriginalRange, params.position)
    );
    if (!pmc) {
        return null;
    }
    let activeParameter = pmc.arguments.findIndex((ma) => rangeContains(ma.originalRange, params.position));
    if (activeParameter === -1) {
        activeParameter = pmc.arguments.length;
    }
    return {
        signatures: [
            {
                label: toStringMacroStatement(pmc.macroStatement),
                parameters: pmc.macroStatement.parameters.map((mp) => ({
                    label: mp.name,
                })),
            },
        ],
        activeSignature: 0,
        activeParameter,
    };
}
