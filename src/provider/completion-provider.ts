import {
    CompletionItem,
    CompletionItemKind,
    CompletionItemLabelDetails,
    CompletionList,
    CompletionParams,
    MarkupContent,
    MarkupKind,
} from 'vscode-languageserver';

import { getCapabilities } from '../core/capability-manager';
import { getSnapshot } from '../core/document-manager';
import {
    dshlFunctions,
    dshlKeywords,
    dshlModifiers,
    dshlNonPrimitiveShortTypes,
    dshlNonPrimitiveTypes,
    dshlPrimitiveShortTypes,
    dshlPrimitiveTypes,
    dshlVariables,
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
        return getDshlItems();
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
        'preprocessor directive'
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
    addCompletionItems(result, hlslEnumTypes, CompletionItemKind.Class, 'type');
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
    addCompletionItems(
        result,
        createVectorAndMatrixTypes(hlslPrimitiveTypes),
        CompletionItemKind.Class,
        'type'
    );
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
    return result;
}

function getDshlItems(): CompletionItem[] {
    const result: CompletionItem[] = [];
    addCompletionItems(
        result,
        dshlKeywords,
        CompletionItemKind.Keyword,
        'keyword'
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
        dshlVariables,
        CompletionItemKind.Variable,
        'variable'
    );
    addCompletionItems(
        result,
        dshlFunctions,
        CompletionItemKind.Function,
        'function'
    );
    return result;
}

function addCompletionItems(
    result: CompletionItem[],
    items: LanguageElementInfo[],
    kind: CompletionItemKind,
    type = ''
): void {
    result.push(
        ...items.map<CompletionItem>((item) => ({
            label: item.name,
            kind: getKind(kind),
            detail: getDetail(item, type),
            sortText: item.sortName ?? item.name,
            labelDetails: getLabelDetails(item),
            documentation: getDocumentation(item),
        }))
    );
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
    if (item.additionalInfo) {
        header += ` (${item.additionalInfo})`;
    }
    if (
        getCapabilities().completionDocumentationFormat.length ||
        !item.description
    ) {
        return header;
    } else {
        return `${header}\n${item.description}`;
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
    if (
        getCapabilities().completionDocumentationFormat.includes(
            MarkupKind.Markdown
        )
    ) {
        return {
            kind: MarkupKind.Markdown,
            value:
                (item.description ?? '') + createDocumentationLinks(item.links),
        };
    } else if (
        getCapabilities().completionDocumentationFormat.includes(
            MarkupKind.PlainText
        )
    ) {
        return {
            kind: MarkupKind.PlainText,
            value: item.description ?? '',
        };
    } else {
        return undefined;
    }
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

function createVectorAndMatrixTypes(
    items: LanguageElementInfo[]
): LanguageElementInfo[] {
    const result: LanguageElementInfo[] = [];
    for (const item of items) {
        item.additionalInfo = 'scalar';
        result.push(item);
        for (let i = 1; i <= 4; i++) {
            result.push({
                name: `${item.name}${i}`,
                description: item.description,
                links: item.links,
                type: item.type,
                additionalInfo: 'vector',
            });
            for (let j = 1; j <= 4; j++) {
                result.push({
                    name: `${item.name}${i}x${j}`,
                    description: item.description,
                    links: item.links,
                    type: item.type,
                    additionalInfo: 'matrix',
                });
            }
        }
    }
    return result;
}
