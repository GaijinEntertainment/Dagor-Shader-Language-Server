import { DocumentUri, Position, Range } from 'vscode-languageserver';

import { rangeContains } from '../helper/helper';
import { DefineContext } from '../interface/define-context';
import { DefineStatement } from '../interface/define-statement';
import { ElementRange } from '../interface/element-range';
import { HlslBlock } from '../interface/hlsl-block';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeStatement } from '../interface/include/include-statement';
import { MacroContext } from '../interface/macro/macro-context';
import { MacroContextBase } from '../interface/macro/macro-context-base';
import { MacroStatement } from '../interface/macro/macro-statement';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { RangeWithChildren } from '../interface/range-with-children';

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
    public potentialMacroContexts: MacroContextBase[] = [];
    public defineContexts: DefineContext[] = [];
    public stringRanges: ElementRange[] = [];
    public hlslBlocks: HlslBlock[] = [];

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
        const ic = this.getIncludeContextDeepAt(position);
        const icc = this.getIncludeChain(ic);
        let startPosition = icc.length ? icc[0].startPosition : 0;
        let offset = this.getOffset(
            position,
            startPosition,
            this.preprocessingOffsets
        );
        position -= offset;
        for (let i = 0; i < icc.length; i++) {
            const c = icc[i];
            startPosition =
                icc.length > i + 1 ? icc[i + 1].localStartPosition : 0;
            offset = this.getOffset(
                position,
                startPosition,
                c.snapshot.preprocessingOffsets
            );
            position -= offset;
        }
        const text = icc.length
            ? icc[icc.length - 1].snapshot.originalText
            : this.originalText;
        return this.positionAt(text, position);
    }

    private getIncludeChain(ic: IncludeContext | null): IncludeContext[] {
        if (!ic) {
            return [];
        }
        const result = [ic];
        let current = ic;
        while (current.parent) {
            result.push(current.parent);
            current = current.parent;
        }
        return result.reverse();
    }

    private getOffset(
        position: number,
        startPosition: number,
        pofs: PreprocessingOffset[]
    ): number {
        return (
            pofs
                .filter(
                    (c) =>
                        c.afterEndPosition < position &&
                        c.afterEndPosition >= startPosition
                )
                .map((c) => c.offset)
                .reduce((prev, curr) => prev + curr, 0) + startPosition
        );
    }

    private positionAt(text: string, position: number): Position {
        const lines = text.split('\n');
        let line = 0;
        let character = 0;
        for (; line < lines.length; line++) {
            if (character + lines[line].length >= position) {
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
            po.afterEndPosition = this.updatePosition(
                po.afterEndPosition,
                newPo
            );
        }
        for (const ic of this.includeContexts) {
            this.updateOffsetAndChildren(ic, newPo);
        }
        for (const ms of this.macroStatements) {
            ms.position = this.updatePosition(ms.position, newPo);
        }
        for (const ds of this.defineStatements) {
            ds.position = this.updatePosition(ds.position, newPo);
        }
        for (const mc of this.macroContexts) {
            this.updateOffsetAndChildren(mc, newPo);
        }
        for (const dc of this.defineContexts) {
            dc.startPosition = this.updatePosition(dc.startPosition, newPo);
            dc.afterEndPosition = this.updatePosition(
                dc.afterEndPosition,
                newPo
            );
        }
        for (const sr of this.stringRanges) {
            sr.startPosition = this.updatePosition(sr.startPosition, newPo);
            sr.endPosition = this.updatePosition(sr.endPosition, newPo);
        }
        for (const hb of this.hlslBlocks) {
            hb.startPosition = this.updatePosition(hb.startPosition, newPo);
            hb.endPosition = this.updatePosition(hb.endPosition, newPo);
        }
        this.preprocessingOffsets.push(newPo);
    }

    private updateOffsetAndChildren(
        rwc: RangeWithChildren,
        po: PreprocessingOffset
    ): void {
        rwc.startPosition = this.updatePosition(rwc.startPosition, po);
        rwc.endPosition = this.updatePosition(rwc.endPosition, po);
        for (const tc of rwc.children) {
            this.updateOffsetAndChildren(tc, po);
        }
    }

    private updatePosition(position: number, po: PreprocessingOffset): number {
        if (po.beforeEndPosition <= position) {
            return position + po.offset;
        } else if (po.position < position && position < po.beforeEndPosition) {
            return po.afterEndPosition;
        }
        return position;
    }

    public getIncludeContextAt(position: number): IncludeContext | null {
        return (
            this.includeContexts.find(
                (ic) =>
                    ic.startPosition <= position && position < ic.endPosition
            ) ?? null
        );
    }

    public getIncludeContextDeepAt(position: number): IncludeContext | null {
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

    public getMacroContextAt(position: number): MacroContext | null {
        return (
            this.macroContexts.find(
                (ic) =>
                    ic.startPosition <= position && position < ic.endPosition
            ) ?? null
        );
    }

    public getMacroContextDeepAt(position: number): MacroContext | null {
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
        if (mc.startPosition <= position && position < mc.endPosition) {
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

    public defineContextAt(position: number): DefineContext | null {
        for (const dc of this.defineContexts) {
            const result = this.getDefineContext(dc, position);
            if (result) {
                return result;
            }
        }
        return null;
    }

    private getDefineContext(
        dc: DefineContext,
        position: number
    ): DefineContext | null {
        if (dc.startPosition <= position && position < dc.afterEndPosition) {
            for (const c of dc.children) {
                const result = this.getDefineContext(c, position);
                if (result) {
                    return result;
                }
            }
            return dc;
        }
        return null;
    }

    public getMacroStatement(
        name: string,
        position: number
    ): MacroStatement | null {
        return (
            this.macroStatements.find(
                (ms) => ms.name === name && ms.position <= position
            ) ?? null
        );
    }

    public isInHlslBlock(position: Position): boolean {
        return this.hlslBlocks.some(
            (hb) =>
                !hb.isNotVisible && rangeContains(hb.originalRange, position)
        );
    }
}
