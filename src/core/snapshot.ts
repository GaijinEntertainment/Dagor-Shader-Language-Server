import { DocumentUri, Position, Range } from 'vscode-languageserver';

import { DefineStatement } from '../interface/define-statement';
import { IncludeContext } from '../interface/include-context';
import { IncludeStatement } from '../interface/include-statement';
import { MacroContext } from '../interface/macro-context';
import { MacroStatement } from '../interface/macro-statement';
import { PreprocessingOffset } from '../interface/preprocessing-offset';

export class Snapshot {
    public readonly version: number;
    public readonly uri: DocumentUri;
    public readonly originalText: string;
    public text = '';
    public cleanedText = '';
    public preprocessedText = '';
    public includeStatements: IncludeStatement[] = [];
    public includeContexts: IncludeContext[] = [];
    public defineStatements: DefineStatement[] = [];
    public macroStatements: MacroStatement[] = [];
    public macroContexts: MacroContext[] = [];

    private preprocessingOffsets: PreprocessingOffset[] = [];

    public constructor(version: number, uri: DocumentUri, text: string) {
        this.version = version;
        this.uri = uri;
        this.originalText = text;
    }

    public getOriginalRange(startPosition: number, endPosition: number): Range {
        const originalStartPosition = this.getOriginalPosition(startPosition);
        const originalEndPosition = this.getOriginalPosition(endPosition);
        return {
            start: originalStartPosition,
            end: originalEndPosition,
        };
    }

    public getOriginalPosition(position: number): Position {
        const offset = this.preprocessingOffsets
            .filter((c) => c.position <= position)
            .map((c) => c.offset)
            .reduce((prev, curr) => prev + curr, 0);
        const originalPosition = position - offset;
        return this.positionAt(originalPosition);
    }

    private positionAt(position: number): Position {
        const lines = this.originalText.split('\n');
        let line = 0;
        let character = 0;
        for (; line < lines.length; line++) {
            if (character + lines[line].length + 1 >= position) {
                character = position - character;
                break;
            } else {
                character += lines[line].length + 1;
            }
        }
        return { line, character };
    }

    public addPreprocessingOffset(newPo: PreprocessingOffset): void {
        for (const po of this.preprocessingOffsets) {
            po.position = this.updatePosition(po.position, newPo);
        }
        for (const ic of this.includeContexts) {
            ic.startPosition = this.updatePosition(ic.startPosition, newPo);
            ic.endPosition = this.updatePosition(ic.endPosition, newPo);
        }
        for (const ms of this.macroStatements) {
            ms.position = this.updatePosition(ms.position, newPo);
        }
        for (const mc of this.macroContexts) {
            mc.startPosition = this.updatePosition(mc.startPosition, newPo);
            mc.endPosition = this.updatePosition(mc.endPosition, newPo);
        }
        this.preprocessingOffsets.push(newPo);
    }

    private updatePosition(position: number, po: PreprocessingOffset): number {
        if (po.beforeEndPosition <= position) {
            return position + po.offset;
        } else if (po.position < position && position < po.beforeEndPosition) {
            return po.afterEndPosition;
        }
        return position;
    }

    public includeContextAt(position: number): IncludeContext | null {
        for (const ic of this.includeContexts) {
            const result = this.getIncludeContext(ic, position);
            if (result) {
                return result;
            }
        }
        return null;
    }

    private getIncludeContext(
        ic: IncludeContext,
        position: number
    ): IncludeContext | null {
        if (ic.startPosition <= position && position <= ic.endPosition) {
            for (const c of ic.children) {
                const result = this.getIncludeContext(c, position);
                if (result) {
                    return result;
                }
            }
            return ic;
        }
        return null;
    }

    public macroContextAt(position: number): MacroContext | null {
        for (const mc of this.macroContexts) {
            const result = this.getMacroContext(mc, position);
            if (result) {
                return result;
            }
        }
        return null;
    }

    private getMacroContext(
        mc: MacroContext,
        position: number
    ): MacroContext | null {
        if (mc.startPosition <= position && position <= mc.endPosition) {
            for (const c of mc.children) {
                const result = this.getMacroContext(c, position);
                if (result) {
                    return result;
                }
            }
            return mc;
        }
        return null;
    }
}
