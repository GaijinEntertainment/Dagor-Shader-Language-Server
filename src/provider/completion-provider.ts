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
import { HLSLI_EXTENSION, HLSL_EXTENSION } from '../core/constant';
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
import { isBeforeOrEqual, rangeContains } from '../helper/helper';
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
import { toStringBlockType } from '../interface/block/block-declaration';
import { DefineStatement, toStringDefineStatementParameterList } from '../interface/define-statement';
import { ExpressionRange } from '../interface/expression-range';
import { toStringFunctionParameters } from '../interface/function/function-declaration';
import { HlslBlock } from '../interface/hlsl-block';
import { LanguageElementInfo } from '../interface/language-element-info';
import { toStringMacroParameterList } from '../interface/macro/macro';
import { ShaderStage } from '../interface/shader-stage';
import { dshlSnippets, hlslSnippets } from '../interface/snippets';
import { EnumDeclaration, toStringEnumDeclaration } from '../interface/type/enum-declaration';
import { TypeDeclaration, TypeKeyword, toStringTypeDeclaration } from '../interface/type/type-declaration';
import { getVariableTypeWithInterval } from '../interface/variable/variable-declaration';
import { getPredefineSnapshot } from '../processor/include-processor';
import { getIncludeCompletionInfos } from '../processor/include-resolver';

export async function completionProvider(
    params: CompletionParams
): Promise<CompletionItem[] | CompletionList | undefined | null> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const position = params.position;
    const is = snapshot.getIncludeStatementAtPath(position);
    if (is) {
        const result = await getIncludeCompletionInfos(is, position);
        return result.map<CompletionItem>((fsii) => ({
            label: fsii.name,
            kind: fsii.isFile() ? CompletionItemKind.File : CompletionItemKind.Folder,
        }));
    }
    const includeTriggerCharacters = ['"', '<', '/', '\\'];
    const triggerCharacter = params.context?.triggerCharacter ?? '';
    if (isCursorInCommentOrString(snapshot, position) || includeTriggerCharacters.includes(triggerCharacter)) {
        return null;
    }
    const uri = params.textDocument.uri;
    const hlsl = uri.endsWith(HLSL_EXTENSION) || uri.endsWith(HLSLI_EXTENSION) || snapshot.isInHlslBlock(position);
    const result: CompletionItem[] = [];
    addCompletionItems(result, getMacroParameters(snapshot, position), CompletionItemKind.Constant, 'macro parameter');
    if (hlsl) {
        addHlslItems(result, snapshot, position);
    } else {
        addDshlItems(result, snapshot, position);
    }
    return result;
}

function isCursorInCommentOrString(snapshot: Snapshot, position: Position): boolean {
    return snapshot.noCodeCompletionRanges.some((r) => rangeContains(r, position));
}

function addHlslItems(result: CompletionItem[], snapshot: Snapshot, position: Position): void {
    const er = snapshot.expressionRanges.find((er) => rangeContains(er.originalRange, position));
    if (er) {
        result.push(
            ...(er.type === 'type'
                ? getMembers(er)
                : er.enumDeclaration.members.map((m) => ({
                      label: m.name,
                      kind: getKind(CompletionItemKind.EnumMember),
                      detail: `${m.name} - enum value`,
                      labelDetails: getLabelDetails(m),
                  })))
        );
        return;
    }
    addDefines(result, snapshot, position);
    addCompletionItems(result, hlslKeywords, CompletionItemKind.Keyword, 'keyword');
    addCompletionItems(result, hlslPreprocessorDirectives, CompletionItemKind.Keyword, 'preprocessor directive');
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
    const tds = snapshot.getTypeDeclarationsInScope(position);
    result.push(
        ...tds.map<CompletionItem>((td) => ({
            label: td.name,
            kind: getTypeCompletionItemKind(td.type),
            detail: getDetail(td, td.type),
            documentation: getTypeDeclarationDocumentation(td),
        }))
    );
    const eds = snapshot.getEnumDeclarationsInScope(position);
    result.push(
        ...eds
            .filter((ed) => ed.name)
            .map<CompletionItem>((ed) => ({
                label: ed.name!,
                kind: getKind(CompletionItemKind.Enum),
                detail: `${ed.name} - enum ${ed.isClass ? 'class' : ''}`,
                documentation: getEnumDeclarationDocumentation(ed),
            }))
    );
    const vds = snapshot.getVariableDeclarationsInScope(position, true);
    addCompletionItems(
        result,
        vds.map((vd) => ({ name: vd.name, type: getVariableTypeWithInterval(vd) })),
        CompletionItemKind.Variable,
        'variable'
    );
    addCompletionItems(result, hlslModifiers, CompletionItemKind.Keyword, 'modifier');
    addCompletionItems(result, hlslAttributes, CompletionItemKind.Keyword, 'attribute');
    addCompletionItems(result, hlslSemantics, CompletionItemKind.Keyword, 'semantic');
    addCompletionItems(result, hlslSystemValueSemantics, CompletionItemKind.Keyword, 'semantic');
    addCompletionItems(result, hlslStructTypes, CompletionItemKind.Class, 'type');
    addCompletionItems(result, hlslEnumTypes, CompletionItemKind.Enum, 'enum');
    addCompletionItems(result, hlslBufferTypes, CompletionItemKind.Class, 'type');
    addCompletionItems(result, hlslTextureTypes, CompletionItemKind.Class, 'type');
    addCompletionItems(result, hlslNonPrimitiveTypes, CompletionItemKind.Class, 'type');
    addCompletionItems(result, hlslVectorMatrixStringTypes, CompletionItemKind.Class, 'type');
    addPrimitiveTypes(result, hlslPrimitiveTypes);
    addCompletionItems(result, hlslVariables, CompletionItemKind.Variable, 'variable');
    addCompletionItems(result, hlslFunctions, CompletionItemKind.Function, 'function');
    if (getCapabilities().completionSnippets) {
        addCompletionItems(result, hlslSnippets, CompletionItemKind.Snippet, 'snippet');
    }
}

function getMembers(er: ExpressionRange & { type: 'type' }): CompletionItem[] {
    const result: CompletionItem[] = [];
    addMembers(result, er.typeDeclaration);
    return result;
}

function addMembers(result: CompletionItem[], td: TypeDeclaration): void {
    result.push(
        ...td.members.map((m) => ({
            label: m.name,
            kind: getKind(CompletionItemKind.Field),
            detail: `${m.name} - member variable`,
            labelDetails: getLabelDetails(m),
        }))
    );
    for (const superTd of td.superTypes) {
        addMembers(result, superTd);
    }
}

function getTypeCompletionItemKind(type: TypeKeyword): CompletionItemKind | undefined {
    if (type === 'class') {
        return getKind(CompletionItemKind.Class);
    } else if (type === 'interface') {
        return getKind(CompletionItemKind.Interface);
    } else {
        return getKind(CompletionItemKind.Struct);
    }
}

function addDefines(result: CompletionItem[], snapshot: Snapshot, position: Position): void {
    const predefineSnapshot = getPredefineSnapshot();
    if (predefineSnapshot) {
        result.push(
            ...predefineSnapshot.defineStatements.map<CompletionItem>((ds) =>
                getCompletionItem(
                    ds,
                    CompletionItemKind.Constant,
                    'define',
                    `${toStringDefineStatementParameterList(ds)}`
                )
            )
        );
    }
    if (snapshot.uri.endsWith(HLSL_EXTENSION) || snapshot.uri.endsWith(HLSLI_EXTENSION)) {
        const defines = snapshot.defineStatements;
        addDefinesIfAvailable(result, defines, position);
    } else {
        const md = snapshot.macroDeclarations.find((md) => rangeContains(md.contentOriginalRange, position));
        const definesSnapshot = md?.contentSnapshot ?? snapshot;
        addDefinesInDshl(result, definesSnapshot, position);
        if (md) {
            const hb = definesSnapshot.hlslBlocks.find((hb) => rangeContains(hb.originalRange, position)) ?? null;
            if (hb) {
                addDefinesInHlslBlocks(result, snapshot.globalHlslBlocks, md.originalRange.start, hb.stage);
            }
        }
    }
}

function addDefinesInDshl(result: CompletionItem[], snapshot: Snapshot, position: Position): void {
    const hb = snapshot.hlslBlocks.find((hb) => rangeContains(hb.originalRange, position)) ?? null;
    if (hb) {
        const shaderBlock = snapshot.shaderBlocks.find((sb) => rangeContains(sb.originalRange, position));
        if (shaderBlock) {
            addDefinesInHlslBlocks(result, shaderBlock.hlslBlocks, position, hb.stage);
        }
        addDefinesInHlslBlocks(result, snapshot.globalHlslBlocks, position, hb.stage);
    }
}

function addDefinesInHlslBlocks(
    result: CompletionItem[],
    hbs: HlslBlock[],
    position: Position,
    stage: ShaderStage | null
): void {
    const defines = hbs.filter((hb) => hb.stage === stage || hb.stage === null).flatMap((hb) => hb.defineStatements);
    addDefinesIfAvailable(result, defines, position);
}

function addDefinesIfAvailable(result: CompletionItem[], dss: DefineStatement[], position: Position): void {
    const defines: DefineStatement[] = [];
    for (const ds of dss) {
        if (
            isBeforeOrEqual(ds.codeCompletionPosition, position) &&
            (!ds.undefCodeCompletionPosition || isBeforeOrEqual(position, ds.undefCodeCompletionPosition)) &&
            !result.some((r) => r.label === ds.name && r.kind === CompletionItemKind.Constant) &&
            !defines.some((d) => d.name === ds.name)
        ) {
            defines.push(ds);
        }
    }
    result.push(
        ...defines.map<CompletionItem>((ds) =>
            getCompletionItem(ds, CompletionItemKind.Constant, 'define', `${toStringDefineStatementParameterList(ds)}`)
        )
    );
}

function addDshlItems(result: CompletionItem[], snapshot: Snapshot, position: Position): void {
    addCompletionItems(result, dshlKeywords, CompletionItemKind.Keyword, 'keyword');
    addCompletionItems(result, dshlEnumValues, CompletionItemKind.Value, 'value');
    addCompletionItems(result, dshlModifiers, CompletionItemKind.Keyword, 'modifier');
    addCompletionItems(result, dshlNonPrimitiveTypes, CompletionItemKind.Class, 'type');
    addCompletionItems(result, dshlPrimitiveTypes, CompletionItemKind.Class, 'type');
    addCompletionItems(result, dshlNonPrimitiveShortTypes, CompletionItemKind.Class, 'type');
    addCompletionItems(result, dshlPrimitiveShortTypes, CompletionItemKind.Class, 'type');
    addCompletionItems(result, dshlProperties, CompletionItemKind.Property, 'property');
    result.push(
        ...dshlFunctions.map<CompletionItem>((fi) =>
            getCompletionItem(
                fi,
                CompletionItemKind.Function,
                'function',
                `(${toStringFunctionParameters(fi.parameters)})`
            )
        )
    );
    const macros = snapshot.macros.filter((m) =>
        m.declarations.some((md) => isBeforeOrEqual(md.codeCompletionPosition, position))
    );
    result.push(
        ...macros.map<CompletionItem>((m) =>
            getCompletionItem(m, CompletionItemKind.Constant, 'macro', `${toStringMacroParameterList(m)}`)
        )
    );
    if (getCapabilities().completionSnippets) {
        addCompletionItems(result, dshlSnippets, CompletionItemKind.Snippet, 'snippet');
    }
    const vds = snapshot.getVariableDeclarationsInScope(position, false);
    addCompletionItems(
        result,
        vds.map((vd) => ({ name: vd.name, type: getVariableTypeWithInterval(vd) })),
        CompletionItemKind.Variable,
        'variable'
    );
    const sds = snapshot.getShaderDeclarationsInScope(position);
    addCompletionItems(
        result,
        sds.map((sd) => ({ name: sd.name, type: 'shader' })),
        CompletionItemKind.Module,
        'shader'
    );
    const bds = snapshot.getBlockDeclarationsInScope(position);
    addCompletionItems(
        result,
        bds.map((bd) => ({ name: bd.name, type: toStringBlockType(bd) })),
        CompletionItemKind.Module,
        'block'
    );
}

function getMacroParameters(snapshot: Snapshot, position: Position): LanguageElementInfo[] {
    return snapshot.macroDeclarations
        .filter((md) => rangeContains(md.contentOriginalRange, position))
        .flatMap((md) => md.parameters)
        .map((parameter) => ({
            name: parameter.name,
        }));
}

function addCompletionItems(
    result: CompletionItem[],
    items: LanguageElementInfo[],
    kind: CompletionItemKind,
    type: string
): void {
    result.push(...items.map<CompletionItem>((item) => getCompletionItem(item, kind, type)));
}

function getCompletionItem(
    item: LanguageElementInfo,
    kind: CompletionItemKind,
    type: string,
    parameters?: string
): CompletionItem {
    return {
        label: item.name,
        kind: getKind(kind),
        detail: getDetail(item, type),
        sortText: item.sortName,
        filterText: item.filterText,
        labelDetails: getLabelDetails(item, parameters),
        documentation: getDocumentation(item),
        insertText: item.insertText,
        insertTextFormat: item.isSnippet ? InsertTextFormat.Snippet : undefined,
    };
}

function getKind(kind: CompletionItemKind): CompletionItemKind | undefined {
    return getCapabilities().completionItemKinds.includes(kind) ? kind : undefined;
}

function getDetail(item: LanguageElementInfo, type: string): string {
    let header = item.name;
    if (type) {
        header += ` - ${type}`;
    }
    if (getCapabilities().completionDocumentationFormat.length || !item.description) {
        return header;
    } else {
        const documentation = getDocumentationText(item);
        return `${header}\n${documentation}`;
    }
}

function getLabelDetails(item: LanguageElementInfo, parameters?: string): CompletionItemLabelDetails | undefined {
    return getCapabilities().completionLabelDetails
        ? {
              description: item.type,
              detail: parameters,
          }
        : undefined;
}

function getDocumentation(item: LanguageElementInfo): MarkupContent | undefined {
    const documentationText = getDocumentationText(item);
    if (getCapabilities().completionDocumentationFormat.includes(MarkupKind.Markdown)) {
        return {
            kind: MarkupKind.Markdown,
            value: documentationText + createDocumentationLinks(item.links),
        };
    } else if (getCapabilities().completionDocumentationFormat.includes(MarkupKind.PlainText)) {
        return {
            kind: MarkupKind.PlainText,
            value: documentationText,
        };
    } else {
        return undefined;
    }
}

function getTypeDeclarationDocumentation(td: TypeDeclaration): MarkupContent | undefined {
    const documentationText = toStringTypeDeclaration(td);
    if (getCapabilities().completionDocumentationFormat.includes(MarkupKind.Markdown)) {
        return {
            kind: MarkupKind.Markdown,
            value: '```hlsl\n' + documentationText + '\n```',
        };
    } else if (getCapabilities().completionDocumentationFormat.includes(MarkupKind.PlainText)) {
        return {
            kind: MarkupKind.PlainText,
            value: documentationText,
        };
    } else {
        return undefined;
    }
}

function getEnumDeclarationDocumentation(ed: EnumDeclaration): MarkupContent | undefined {
    const documentationText = toStringEnumDeclaration(ed);
    if (getCapabilities().completionDocumentationFormat.includes(MarkupKind.Markdown)) {
        return {
            kind: MarkupKind.Markdown,
            value: '```hlsl\n' + documentationText + '\n```',
        };
    } else if (getCapabilities().completionDocumentationFormat.includes(MarkupKind.PlainText)) {
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
    } else if (link.startsWith('https://github.com/microsoft/DirectXShaderCompiler')) {
        linkName = 'Open DirectX Shader Compiler documentation';
    }
    return linkName;
}

function addPrimitiveTypes(result: CompletionItem[], items: LanguageElementInfo[]): void {
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

function addScalarTypes(result: CompletionItem[], item: LanguageElementInfo): void {
    result.push(getCompletionItem(item, CompletionItemKind.Class, 'type'));
    result.push(
        getCompletionItem(
            { ...item, type: item.name, description: undefined },
            CompletionItemKind.Constructor,
            'constructor'
        )
    );
}

function addVectorTypes(result: CompletionItem[], item: LanguageElementInfo, i: number): void {
    const vectorLink = 'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-vector';
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
    result.push(getCompletionItem(constructor, CompletionItemKind.Constructor, 'constructor'));
}

function addMatrixTypes(result: CompletionItem[], item: LanguageElementInfo, i: number, j: number): void {
    const matrixLink = 'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-matrix';
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
    result.push(getCompletionItem(constructor, CompletionItemKind.Constructor, 'constructor'));
}
