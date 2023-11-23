import { DocumentUri, Range } from 'vscode-languageserver';

import { IncludeType } from './include-type';

export interface IncludeStatement {
    name: string;
    originalRange: Range;
    type: IncludeType;
    includerUri: DocumentUri;
}
