import { Color, ColorPresentation, ColorPresentationParams } from 'vscode-languageserver';

import { getSnapshot } from '../core/document-manager';
import { ColorPickerInfo } from '../interface/color-picker-info';

export async function colorPresentationProvider(
    params: ColorPresentationParams
): Promise<ColorPresentation[] | null | undefined> {
    const snapshot = await getSnapshot(params.textDocument.uri);
    if (!snapshot) {
        return null;
    }
    const cpi = snapshot.getColorPickerInfoAt(params.range);
    if (!cpi) {
        return null;
    }
    const newText = createNewText(cpi, params.color);
    const label = createLabel(cpi, newText);
    return [
        {
            label,
            textEdit: {
                newText,
                range: cpi.originalRange,
            },
        },
    ];
}

function createNewText(cpi: ColorPickerInfo, color: Color): string {
    let newText = `${round(color.red)}, ${round(color.green)}, ${round(color.blue)}`;
    if (cpi.color.length === 4) {
        newText += `, ${round(color.alpha)}`;
    }
    return newText;
}

function createLabel(cpi: ColorPickerInfo, newText: string): string {
    let label: string;
    if (cpi.color.length === 4) {
        label = 'float4';
    } else {
        label = 'float3';
    }
    label += `(${newText})`;
    return label;
}

function round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
