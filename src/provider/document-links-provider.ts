import { DocumentLink, DocumentLinkParams, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { getCapabilities } from '../core/capability-manager';
import { showDocumentLinkDebugLabel } from '../core/debug';
import { rangesEqual } from '../helper/helper';
import { IncludeData } from '../helper/include-data';
import { IncludeType } from '../helper/include-type';
import { getDocuments } from '../helper/server-helper';

export function documentLinksProvider(dlp: DocumentLinkParams): DocumentLink[] {
    const document = getDocuments().get(dlp.textDocument.uri);
    if (document == null) {
        return [];
    }
    const links: DocumentLink[] = [];
    const text = preprocess(document.getText());
    addIncludeLinks(document, text, links, IncludeType.HLSL_QUOTED);
    addIncludeLinks(document, text, links, IncludeType.HLSL_ANGULAR);
    addIncludeLinks(document, text, links, IncludeType.DAGORSH);
    return links;
}

function addIncludeLinks(
    document: TextDocument,
    text: string,
    links: DocumentLink[],
    includeType: IncludeType
): void {
    const includeRegex = getIncludeRegex(includeType);
    let regexResult: RegExpExecArray | null;
    while ((regexResult = includeRegex.exec(text))) {
        const range = {
            start: document.positionAt(regexResult.index),
            end: document.positionAt(regexResult.index + regexResult[0].length),
        };
        if (links.every((link) => !rangesEqual(link.range, range))) {
            const link = createLink(document, includeType, range);
            links.push(link);
        }
    }
}

// at the moment it only replaces comments with spaces
// later there will be a full preprocessing
function preprocess(text: string): string {
    const blockCommentRegex = /\/\*[\s\S]*?\*\//gm;
    let regexResult: RegExpExecArray | null;
    while ((regexResult = blockCommentRegex.exec(text))) {
        text = replaceExcept(
            text,
            regexResult.index,
            regexResult[0].length,
            ' ',
            '\r',
            '\n'
        );
    }
    const singleLineCommentRegex = /\/\/.*?$/gm;
    while ((regexResult = singleLineCommentRegex.exec(text))) {
        text = replaceExcept(
            text,
            regexResult.index,
            regexResult[0].length,
            ' ',
            '\r',
            '\n'
        );
    }
    return text;
}

function replaceExcept(
    text: string,
    start: number,
    length: number,
    replacement: string,
    ...exceptCharacters: string[]
): string {
    let result = text;
    for (let i = start; i < start + length; i++) {
        if (exceptCharacters.every((char) => char !== result[i])) {
            result =
                result.substring(0, i) + replacement + result.substring(i + 1);
        }
    }
    return result;
}

function getIncludeRegex(includeType: IncludeType): RegExp {
    if (includeType === IncludeType.HLSL_QUOTED) {
        return /(?<=#\s*include(\s|\/\*.*?\*\/)+").*?(?=")/g;
    } else if (includeType === IncludeType.HLSL_ANGULAR) {
        return /(?<=#\s*include(\s|\/\*.*?\*\/)+<).*?(?=>)/g;
    } else {
        return /(?<=\binclude(_optional)?(\s|\/\*.*?\*\/)+").*?(?=")/g;
    }
}

function createLink(
    textDocument: TextDocument,
    includeType: IncludeType,
    range: Range
): DocumentLink {
    const data: IncludeData = {
        name: textDocument.getText(range),
        searchInLocalFolder: includeType === IncludeType.HLSL_QUOTED,
        uri: textDocument.uri,
    };
    const tooltip = getDebugTooltip(includeType);
    return { range, data, tooltip };
}

function getDebugTooltip(includeType: IncludeType): string | undefined {
    if (!showDocumentLinkDebugLabel || !getCapabilities().documentLinkTooltip) {
        return undefined;
    }
    if (includeType === IncludeType.HLSL_QUOTED) {
        return 'HLSL quoted';
    } else if (includeType === IncludeType.HLSL_ANGULAR) {
        return 'HLSL angular';
    } else {
        return 'DagorSH';
    }
}
