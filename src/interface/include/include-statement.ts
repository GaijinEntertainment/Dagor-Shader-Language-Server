import { DocumentUri, Position, Range } from 'vscode-languageserver';

import { IncludeType } from './include-type';

export interface IncludeStatement {
    path: string;
    pathOriginalRange: Range;
    originalEndPosition: Position;
    type: IncludeType;
    includerUri: DocumentUri;
}
