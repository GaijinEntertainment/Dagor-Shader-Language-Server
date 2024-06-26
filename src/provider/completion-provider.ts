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
import { createDocumentationLinks, isBeforeOrEqual, rangeContains } from '../helper/helper';
import { hlslFunctions } from '../helper/hlsl-function';
import {
    hlslAttributes,
    hlslBufferTypes,
    hlslDshlPreprocessorDirectives,
    hlslKeywords,
    hlslModifiers,
    hlslNonPrimitiveTypes,
    hlslOtherTypes,
    hlslPreprocessorDirectives,
    hlslPreprocessorPragmaDirectives,
    hlslPrimitiveTypes,
    hlslSemantics,
    hlslSystemValueSemantics,
    hlslTextureTypes,
    hlslVariables,
    hlslVectorMatrixStringTypes,
} from '../helper/hlsl-info';
import { toStringBlockType } from '../interface/block/block-declaration';
import { DefineStatement, toStringDefineStatementParameterList } from '../interface/define-statement';
import { ExpressionRange, NameExpressionRange } from '../interface/expression-range';
import { toStringFunctionParameters } from '../interface/function/function-parameter';
import { HlslBlock } from '../interface/hlsl-block';
import { LanguageElementInfo } from '../interface/language-element-info';
import { toStringMacroParameterList } from '../interface/macro/macro';
import { ShaderStage } from '../interface/shader-stage';
import { dshlSnippets, hlslSnippets } from '../interface/snippets';
import { getEnumInfo } from '../interface/type/enum-declaration';
import { getEnumMemberInfo } from '../interface/type/enum-member-declaration';
import { TypeDeclaration, TypeKeyword, getTypeInfo } from '../interface/type/type-declaration';
import { toStringVariableType } from '../interface/variable/variable-declaration';
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

function addHlslMembers(result: CompletionItem[], er: ExpressionRange): void {
    if (er.type === 'type') {
        result.push(...getMembers(er));
    } else if (er.type === 'enum') {
        result.push(
            ...er.enumDeclaration.members.map((m) => ({
                label: m.name,
                kind: getKind(CompletionItemKind.EnumMember),
                detail: `${m.name} - enum value`,
                documentation: getEnumMemberInfo(m, getCapabilities().completionDocumentationFormat),
            }))
        );
    } else if (er.type === 'name') {
        addMethods(result, er, hlslBufferTypes);
        addMethods(result, er, hlslTextureTypes);
    }
}

function addMethods(result: CompletionItem[], er: NameExpressionRange, leis: LanguageElementInfo[]): void {
    const type = leis.find((b) => b.name === er.name);
    if (type?.methods) {
        result.push(
            ...type.methods.map<CompletionItem>((m) => ({
                label: m.name,
                kind: getKind(CompletionItemKind.Method),
                detail: `${m.name} - method`,
                documentation: m.description,
                labelDetails: getLabelDetails(m.returnType, `(${toStringFunctionParameters(m.parameters)})`),
            }))
        );
    }
}

function addHlslItems(result: CompletionItem[], snapshot: Snapshot, position: Position): void {
    const er = snapshot.expressionRanges.find((er) => rangeContains(er.originalRange, position));
    if (er) {
        addHlslMembers(result, er);
        return;
    }
    addCompletionItems(result, getMacroParameters(snapshot, position), CompletionItemKind.Constant, 'macro parameter');
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
    const tds = snapshot.getTypeDeclarationsInScope(position).filter((td) => td.name);
    result.push(
        ...tds.map<CompletionItem>((td) => ({
            label: td.name!,
            kind: getTypeCompletionItemKind(td.type),
            detail: `${td.name} - ${td.type}`,
            documentation: getTypeInfo(td, getCapabilities().completionDocumentationFormat),
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
                documentation: getEnumInfo(ed, getCapabilities().completionDocumentationFormat),
            }))
    );
    result.push(
        ...eds
            .filter((ed) => ed.name && !ed.isClass)
            .flatMap((ed) => ed.members)
            .map<CompletionItem>((emd) => ({
                label: emd.name,
                kind: getKind(CompletionItemKind.EnumMember),
                detail: `${emd.name} - enum value`,
                documentation: getEnumMemberInfo(emd, getCapabilities().completionDocumentationFormat),
            }))
    );
    const vds = snapshot.getVariableDeclarationsInScope(position, true);
    addCompletionItems(
        result,
        vds.map((vd) => ({ name: vd.name, type: toStringVariableType(vd) })),
        CompletionItemKind.Variable,
        'variable'
    );
    const fds = snapshot.getFunctionDeclarationsInScope(position);
    result.push(
        ...fds.map<CompletionItem>((fd) =>
            getCompletionItem(
                fd,
                CompletionItemKind.Function,
                'function',
                `(${toStringFunctionParameters(fd.parameters)})`
            )
        )
    );
    addCompletionItems(result, hlslModifiers, CompletionItemKind.Keyword, 'modifier');
    addCompletionItems(result, hlslAttributes, CompletionItemKind.Keyword, 'attribute');
    addCompletionItems(result, hlslSemantics, CompletionItemKind.Keyword, 'semantic');
    addCompletionItems(result, hlslSystemValueSemantics, CompletionItemKind.Keyword, 'semantic');
    addCompletionItems(result, hlslOtherTypes, CompletionItemKind.Class, 'type');
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
    addEmbeddedItems(result, er.typeDeclaration);
    return result;
}

function addEmbeddedItems(result: CompletionItem[], td: TypeDeclaration): void {
    for (const etd of td.embeddedTypes.filter((etd) => etd.name)) {
        result.push({
            label: etd.name!,
            kind: getTypeCompletionItemKind(etd.type),
            detail: `${etd.name} - ${etd.type}`,
            documentation: getTypeInfo(etd, getCapabilities().completionDocumentationFormat),
        });
    }
    for (const eed of td.embeddedEnums.filter((eed) => eed.name)) {
        result.push({
            label: eed.name!,
            kind: getKind(CompletionItemKind.Enum),
            detail: `${eed.name} - enum`,
            documentation: getEnumInfo(eed, getCapabilities().completionDocumentationFormat),
        });
    }
    for (const eemd of td.embeddedEnums.filter((eed) => !eed.name).flatMap((eed) => eed.members)) {
        result.push({
            label: eemd.name,
            kind: getKind(CompletionItemKind.EnumMember),
            detail: `${eemd.name} - enum value`,
            documentation: getEnumMemberInfo(eemd, getCapabilities().completionDocumentationFormat),
        });
    }
}

function addMembers(result: CompletionItem[], td: TypeDeclaration): void {
    result.push(
        ...td.members.map((m) => ({
            label: m.name,
            kind: getKind(CompletionItemKind.Field),
            detail: `${m.name} - member variable`,
            labelDetails: getLabelDetails(m.type),
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
    addCompletionItems(result, getMacroParameters(snapshot, position), CompletionItemKind.Constant, 'macro parameter');
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
        vds.map((vd) => ({ name: vd.name, type: toStringVariableType(vd) })),
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
        labelDetails: getLabelDetails(item.type, parameters),
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

function getLabelDetails(type?: string, parameters?: string): CompletionItemLabelDetails | undefined {
    return getCapabilities().completionLabelDetails
        ? {
              description: type,
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

function getDocumentationText(item: LanguageElementInfo): string {
    let documentation = item.description ?? '';
    if (item.additionalInfo) {
        documentation = `${item.additionalInfo}\n\n${documentation}`;
    }
    return documentation;
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
