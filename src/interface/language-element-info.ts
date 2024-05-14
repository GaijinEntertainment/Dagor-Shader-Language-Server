import { TypeKeyword } from './type/type-declaration';

export interface LanguageElementInfo {
    name: string;
    sortName?: string;
    insertText?: string;
    filterText?: string;
    isSnippet?: boolean;
    description?: string;
    links?: string[];
    type?: string;
    value?: string;
    keyword?: TypeKeyword | 'enum';
    members?: LanguageElementInfo[];
    additionalInfo?: string;
}
