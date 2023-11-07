import { DocumentLink, DocumentLinkParams, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { rangesEqual } from '../helper/helper';
import { IncludeData } from '../helper/include-data';
import { IncludeType } from '../helper/include-type';
import { getDocuments } from '../helper/server-helper';

const debugLabel = false;

export function documentLinksProvider(dlp: DocumentLinkParams): DocumentLink[] {
    const textDocument = getDocuments().get(dlp.textDocument.uri);
    if (textDocument == null) {
        return [];
    }
    const links: DocumentLink[] = [];
    addIncludeLinks(textDocument, links, IncludeType.HLSL_QUOTED);
    addIncludeLinks(textDocument, links, IncludeType.HLSL_ANGULAR);
    addIncludeLinks(textDocument, links, IncludeType.DAGORSH);
    return links;
}

function addIncludeLinks(
    textDocument: TextDocument,
    links: DocumentLink[],
    includeType: IncludeType
): void {
    const text = textDocument.getText();
    const pattern = getIncludePattern(includeType);
    let regexResult: RegExpExecArray | null;
    while ((regexResult = pattern.exec(text))) {
        const range = {
            start: textDocument.positionAt(regexResult.index),
            end: textDocument.positionAt(
                regexResult.index + regexResult[0].length
            ),
        };
        if (links.every((link) => !rangesEqual(link.range, range))) {
            const link = createLink(textDocument, includeType, range);
            links.push(link);
        }
    }
}

function getIncludePattern(includeType: IncludeType): RegExp {
    if (includeType === IncludeType.HLSL_QUOTED) {
        return /(?<=#\s*include(\s|\/\*.*?\*\/)+").*?(?=")/g;
    } else if (includeType === IncludeType.HLSL_ANGULAR) {
        return /(?<=#\s*include(\s|\/\*.*?\*\/)+<).*?(?=>)/g;
    } else {
        return /(?<=\binclude(\s|\/\*.*?\*\/)+").*?(?=")/g;
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
    if (!debugLabel) {
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
