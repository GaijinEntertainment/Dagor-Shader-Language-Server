import { DocumentUri } from 'vscode-languageserver';

export interface IncludeContext {
    uri: DocumentUri;
    startPosition: number;
    endPosition: number;
    parent: IncludeContext | null;
    children: IncludeContext[];
}
