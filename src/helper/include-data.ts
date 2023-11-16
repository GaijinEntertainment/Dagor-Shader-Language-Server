import { DocumentUri } from 'vscode-languageserver';

export interface IncludeData {
    name: string;
    searchInLocalFolder: boolean;
    uri: DocumentUri;
}
