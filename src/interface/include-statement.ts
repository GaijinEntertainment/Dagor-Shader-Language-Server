import { DocumentUri, Range } from 'vscode-languageserver';

import { IncludeType } from './include-type';

export interface IncludeStatement {
    path: string;
    pathOriginalRange: Range;
    type: IncludeType;
    includerUri: DocumentUri;
}
