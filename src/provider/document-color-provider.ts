import { ColorInformation, DocumentColorParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';

export async function documentColorProvider(
    params: DocumentColorParams
): Promise<ColorInformation[] | null | undefined> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const result: ColorInformation[] = [];
    for (const cpi of snapshot.colorPickerInfos) {
        result.push({
            range: cpi.originalRange,
            color: {
                red: cpi.color[0],
                green: cpi.color[1],
                blue: cpi.color[2],
                alpha: cpi.color.length === 4 ? cpi.color[3] : 1,
            },
        });
    }
    return result;
}
