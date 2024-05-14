import { Position, SemanticTokens, SemanticTokensBuilder, SemanticTokensParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { Scope } from '../helper/scope';

interface SemanticItem {
    position: Position;
    length: number;
    type: number;
}

export async function semanticTokensProvider(params: SemanticTokensParams): Promise<SemanticTokens | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const stb = new SemanticTokensBuilder();
    const result: SemanticItem[] = [];
    addTokens(snapshot.rootScope, result);
    result.sort((a, b) =>
        a.position.line !== b.position.line
            ? a.position.line - b.position.line
            : a.position.character - b.position.character
    );
    for (const item of result) {
        stb.push(item.position.line, item.position.character, item.length, item.type, 0);
    }
    return stb.build();
}

function addTokens(scope: Scope, stb: SemanticItem[]): void {
    const TYPE = 0;
    const VARIABLE = 1;
    for (const tu of scope.typeUsages) {
        if (tu.isVisible) {
            stb.push({
                position: tu.originalRange.start,
                length: tu.declaration.name?.length ?? 0,
                type: TYPE,
            });
        }
    }
    for (const vd of scope.variableDeclarations) {
        if (vd.isVisible) {
            stb.push({
                position: vd.nameOriginalRange.start,
                length: vd.name.length,
                type: VARIABLE,
            });
        }
    }
    for (const childScope of scope.children) {
        addTokens(childScope, stb);
    }
}
