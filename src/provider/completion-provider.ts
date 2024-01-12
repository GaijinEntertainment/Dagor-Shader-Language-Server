import {
    CompletionItem,
    CompletionItemKind,
    CompletionItemLabelDetails,
    CompletionList,
    CompletionParams,
    InsertTextFormat,
    MarkupContent,
    MarkupKind,
    Position,
} from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import { Snapshot } from '../core/snapshot';
import {
    dshlEnumValues,
    dshlFunctions,
    dshlKeywords,
    dshlModifiers,
    dshlNonPrimitiveShortTypes,
    dshlNonPrimitiveTypes,
    dshlPrimitiveShortTypes,
    dshlPrimitiveTypes,
    dshlProperties,
} from '../helper/dshl-info';
import {
    hlslAttributes,
    hlslBufferTypes,
    hlslDshlPreprocessorDirectives,
    hlslEnumTypes,
    hlslFunctions,
    hlslKeywords,
    hlslModifiers,
    hlslNonPrimitiveTypes,
    hlslPreprocessorDirectives,
    hlslPreprocessorPragmaDirectives,
    hlslPrimitiveTypes,
    hlslSemantics,
    hlslStructTypes,
    hlslSystemValueSemantics,
    hlslTextureTypes,
    hlslVariables,
    hlslVectorMatrixStringTypes,
} from '../helper/hlsl-info';
import { LanguageElementInfo } from '../interface/language-element-info';
import { dshlSnippets, hlslSnippets } from '../interface/snippets';

export async function completionProvider(
    params: CompletionParams
): Promise<CompletionItem[] | CompletionList | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const hlsl =
        params.textDocument.uri.endsWith('.hlsl') ||
        snapshot.isInHlslBlock(params.position);
    if (hlsl) {
        return getHlslItems();
    } else {
        return getDshlItems(snapshot, params.position);
    }
}

function getHlslItems(): CompletionItem[] {
    const result: CompletionItem[] = [];
    addCompletionItems(
        result,
        hlslKeywords,
        CompletionItemKind.Keyword,
        'keyword'
    );
    addCompletionItems(
        result,
        hlslPreprocessorDirectives,
        CompletionItemKind.Keyword,
        'preprocessor directive'
    );
    addCompletionItems(
        result,
        hlslPreprocessorPragmaDirectives,
        CompletionItemKind.Keyword,
        'preprocessor pragma directive'
    );
    addCompletionItems(
        result,
        hlslDshlPreprocessorDirectives,
        CompletionItemKind.Keyword,
        'DSHL preprocessor directive'
    );
    addCompletionItems(
        result,
        hlslModifiers,
        CompletionItemKind.Keyword,
        'modifier'
    );
    addCompletionItems(
        result,
        hlslAttributes,
        CompletionItemKind.Keyword,
        'attribute'
    );
    addCompletionItems(
        result,
        hlslSemantics,
        CompletionItemKind.Keyword,
        'semantic'
    );
    addCompletionItems(
        result,
        hlslSystemValueSemantics,
        CompletionItemKind.Keyword,
        'semantic'
    );
    addCompletionItems(
        result,
        hlslStructTypes,
        CompletionItemKind.Class,
        'type'
    );
    addCompletionItems(result, hlslEnumTypes, CompletionItemKind.Enum, 'enum');
    addCompletionItems(
        result,
        hlslBufferTypes,
        CompletionItemKind.Class,
        'type'
    );
    addCompletionItems(
        result,
        hlslTextureTypes,
        CompletionItemKind.Class,
        'type'
    );
    addCompletionItems(
        result,
        hlslNonPrimitiveTypes,
        CompletionItemKind.Class,
        'type'
    );
    addCompletionItems(
        result,
        hlslVectorMatrixStringTypes,
        CompletionItemKind.Class,
        'type'
    );
    addPrimitiveTypes(result, hlslPrimitiveTypes);
    addCompletionItems(
        result,
        hlslVariables,
        CompletionItemKind.Variable,
        'variable'
    );
    addCompletionItems(
        result,
        hlslFunctions,
        CompletionItemKind.Function,
        'function'
    );
    if (getCapabilities().completionSnippets) {
        addCompletionItems(
            result,
            hlslSnippets,
            CompletionItemKind.Snippet,
            'snippet'
        );
    }
    return result;
}

function getDshlItems(
    snapshot: Snapshot,
    position: Position
): CompletionItem[] {
    const result: CompletionItem[] = [];
    addCompletionItems(
        result,
        dshlKeywords,
        CompletionItemKind.Keyword,
        'keyword'
    );
    addCompletionItems(
        result,
        dshlEnumValues,
        CompletionItemKind.Value,
        'value'
    );
    addCompletionItems(
        result,
        dshlModifiers,
        CompletionItemKind.Keyword,
        'modifier'
    );
    addCompletionItems(
        result,
        dshlNonPrimitiveTypes,
        CompletionItemKind.Class,
        'type'
    );
    addCompletionItems(
        result,
        dshlPrimitiveTypes,
        CompletionItemKind.Class,
        'type'
    );
    addCompletionItems(
        result,
        dshlNonPrimitiveShortTypes,
        CompletionItemKind.Class,
        'type'
    );
    addCompletionItems(
        result,
        dshlPrimitiveShortTypes,
        CompletionItemKind.Class,
        'type'
    );
    addCompletionItems(
        result,
        dshlProperties,
        CompletionItemKind.Property,
        'property'
    );
    addCompletionItems(
        result,
        dshlFunctions,
        CompletionItemKind.Function,
        'function'
    );
    addCompletionItems(
        result,
        getMacros(snapshot, position),
        CompletionItemKind.Constant,
        'macro'
    );
    if (getCapabilities().completionSnippets) {
        addCompletionItems(
            result,
            dshlSnippets,
            CompletionItemKind.Snippet,
            'snippet'
        );
    }
    return result;
}

function getMacros(
    snapshot: Snapshot,
    position: Position
): LanguageElementInfo[] {
    return snapshot.macroStatements
        .filter(
            (ms) =>
                ms.codeCompletionPosition.line < position.line ||
                (ms.codeCompletionPosition.line === position.line &&
                    ms.codeCompletionPosition.character <= position.character)
        )
        .map((ms) => ({
            name: ms.name,
        }));
}

function addCompletionItems(
    result: CompletionItem[],
    items: LanguageElementInfo[],
    kind: CompletionItemKind,
    type = ''
): void {
    result.push(
        ...items.map<CompletionItem>((item) =>
            getCompletionItem(item, kind, type)
        )
    );
}

function getCompletionItem(
    item: LanguageElementInfo,
    kind: CompletionItemKind,
    type = ''
): CompletionItem {
    return {
        label: item.name,
        kind: getKind(kind),
        detail: getDetail(item, type),
        sortText: item.sortName,
        filterText: item.filterText,
        labelDetails: getLabelDetails(item),
        documentation: getDocumentation(item),
        insertText: item.insertText,
        insertTextFormat: item.isSnippet ? InsertTextFormat.Snippet : undefined,
    };
}

function getKind(kind: CompletionItemKind): CompletionItemKind | undefined {
    return getCapabilities().completionItemKinds.includes(kind)
        ? kind
        : undefined;
}

function getDetail(item: LanguageElementInfo, type: string): string {
    let header = item.name;
    if (type) {
        header += ` - ${type}`;
    }
    if (
        getCapabilities().completionDocumentationFormat.length ||
        !item.description
    ) {
        return header;
    } else {
        const documentation = getDocumentationText(item);
        return `${header}\n${documentation}`;
    }
}

function getLabelDetails(
    item: LanguageElementInfo
): CompletionItemLabelDetails | undefined {
    return getCapabilities().completionLabelDetails
        ? {
              description: item.type,
          }
        : undefined;
}

function getDocumentation(
    item: LanguageElementInfo
): MarkupContent | undefined {
    const documentationText = getDocumentationText(item);
    if (
        getCapabilities().completionDocumentationFormat.includes(
            MarkupKind.Markdown
        )
    ) {
        return {
            kind: MarkupKind.Markdown,
            value: documentationText + createDocumentationLinks(item.links),
        };
    } else if (
        getCapabilities().completionDocumentationFormat.includes(
            MarkupKind.PlainText
        )
    ) {
        return {
            kind: MarkupKind.PlainText,
            value: documentationText,
        };
    } else {
        return undefined;
    }
}

function getDocumentationText(item: LanguageElementInfo): string {
    let documentation = item.description ?? '';
    if (item.additionalInfo) {
        documentation = `${item.additionalInfo}\n\n${documentation}`;
    }
    return documentation;
}

function createDocumentationLinks(links: string[] | undefined): string {
    let result = '';
    if (links) {
        for (const link of links) {
            const linkName = getLinkName(link);
            result += `\n\n[${linkName}](${link})`;
        }
    }
    return result;
}

function getLinkName(link: string): string {
    let linkName = 'Open documentation';
    if (link.startsWith('https://microsoft.github.io/DirectX-Specs')) {
        linkName = 'Open DirectX Specs documentation';
    } else if (link.startsWith('https://learn.microsoft.com')) {
        linkName = 'Open Microsoft Learn documentation';
    } else if (
        link.startsWith('https://github.com/microsoft/DirectXShaderCompiler')
    ) {
        linkName = 'Open DirectX Shader Compiler documentation';
    }
    return linkName;
}

function addPrimitiveTypes(
    result: CompletionItem[],
    items: LanguageElementInfo[]
): void {
    for (const item of items) {
        addScalarTypes(result, item);
        for (let i = 1; i <= 4; i++) {
            addVectorTypes(result, item, i);
            for (let j = 1; j <= 4; j++) {
                addMatrixTypes(result, item, i, j);
            }
        }
    }
}

function addScalarTypes(
    result: CompletionItem[],
    item: LanguageElementInfo
): void {
    result.push(getCompletionItem(item, CompletionItemKind.Class, 'type'));
    result.push(
        getCompletionItem(
            { ...item, type: item.name, description: undefined },
            CompletionItemKind.Constructor,
            'constructor'
        )
    );
}

function addVectorTypes(
    result: CompletionItem[],
    item: LanguageElementInfo,
    i: number
): void {
    const vectorLink =
        'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-vector';
    const name = `${item.name}${i}`;
    const vector: LanguageElementInfo = {
        ...item,
        name,
        links: [vectorLink, ...(item.links ?? [])],
        additionalInfo: 'Documentation about the vector elements:',
    };
    const constructor: LanguageElementInfo = {
        ...item,
        name,
        type: name,
        links: [vectorLink, ...(item.links ?? [])],
        description: undefined,
    };
    result.push(getCompletionItem(vector, CompletionItemKind.Class, 'type'));
    result.push(
        getCompletionItem(
            constructor,
            CompletionItemKind.Constructor,
            'constructor'
        )
    );
}

function addMatrixTypes(
    result: CompletionItem[],
    item: LanguageElementInfo,
    i: number,
    j: number
): void {
    const matrixLink =
        'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-matrix';
    const name = `${item.name}${i}x${j}`;
    const matrix: LanguageElementInfo = {
        ...item,
        name,
        links: [matrixLink, ...(item.links ?? [])],
        additionalInfo: 'Documentation about the matrix elements:',
    };
    const constructor: LanguageElementInfo = {
        ...item,
        name,
        type: name,
        links: [matrixLink, ...(item.links ?? [])],
        description: undefined,
    };
    result.push(getCompletionItem(matrix, CompletionItemKind.Class, 'type'));
    result.push(
        getCompletionItem(
            constructor,
            CompletionItemKind.Constructor,
            'constructor'
        )
    );
}
