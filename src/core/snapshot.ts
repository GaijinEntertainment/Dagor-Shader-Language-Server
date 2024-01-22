import { DocumentUri, Position, Range } from 'vscode-languageserver';

import { defaultPosition, rangeContains } from '../helper/helper';
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
import { SnapshotVersion } from '../interface/snapshot-version';

export class Snapshot {
    public readonly version: SnapshotVersion;
    public readonly uri: DocumentUri;
    public readonly originalText: string;
    private originalTextOffsets: ElementRange[] = [];
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
    public noCodeCompletionRanges: Range[] = [];
    public preprocessingOffsets: PreprocessingOffset[] = [];

    public constructor(version: SnapshotVersion, uri: DocumentUri, text: string) {
        this.version = version;
        this.uri = uri;
        this.originalText = text;
        this.computeOriginalTextOffsets();
    }

    private computeOriginalTextOffsets(): void {
        const lines = this.originalText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let linesBefore = 0;
            if (i !== 0) {
                linesBefore = this.originalTextOffsets[i - 1].endPosition + 1;
            }
            this.originalTextOffsets.push({ startPosition: linesBefore, endPosition: linesBefore + line.length });
        }
    }

    public getOriginalRange(startPosition: number, endPosition: number): Range {
        const originalStartPosition = this.getOriginalPosition(startPosition, true);
        const originalEndPosition = this.getOriginalPosition(endPosition, false);
        return {
            start: originalStartPosition,
            end: originalEndPosition,
        };
    }

    public getOriginalPosition(position: number, start: boolean): Position {
        const ic = this.getIncludeContextDeepAt(position);
        const icc = this.getIncludeChain(ic);
        position = this.getOriginalOffset(position, start);
        const originalTextOffsets = icc.length
            ? icc[icc.length - 1].snapshot.originalTextOffsets
            : this.originalTextOffsets;
        return this.positionAt(originalTextOffsets, position);
    }

    public getOriginalOffset(position: number, start: boolean): number {
        const ic = this.getIncludeContextDeepAt(position);
        const icc = this.getIncludeChain(ic);
        return this.getOriginalOffsetWithIncludeContext(position, start, icc);
    }

    private getOriginalOffsetWithIncludeContext(position: number, start: boolean, icc: IncludeContext[]): number {
        let startPosition = icc.length ? icc[0].startPosition : 0;
        let offset = this.getOffset(position, start, startPosition, this.preprocessingOffsets);
        position -= offset;
        for (let i = 0; i < icc.length; i++) {
            const c = icc[i];
            startPosition = icc.length > i + 1 ? icc[i + 1].localStartPosition : 0;
            offset = this.getOffset(position, start, startPosition, c.snapshot.preprocessingOffsets);
            position -= offset;
        }
        return position;
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

    private getOffset(position: number, start: boolean, startPosition: number, pofs: PreprocessingOffset[]): number {
        return (
            pofs
                .filter((c) => this.isInRange(position, start, startPosition, c))
                .map((c) => c.offset)
                .reduce((prev, curr) => prev + curr, 0) + startPosition
        );
    }

    private isInRange(position: number, start: boolean, startPosition: number, c: PreprocessingOffset): boolean {
        if (start) {
            return c.afterEndPosition <= position && c.afterEndPosition >= startPosition;
        } else {
            return c.afterEndPosition < position && c.afterEndPosition >= startPosition;
        }
    }

    private positionAt(originalTextOffsets: ElementRange[], position: number): Position {
        let lowerIndex = 0;
        let upperIndex = originalTextOffsets.length - 1;
        let currentIndex: number;
        while (lowerIndex <= upperIndex) {
            currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
            if (
                position >= originalTextOffsets[currentIndex].startPosition &&
                position <= originalTextOffsets[currentIndex].endPosition
            ) {
                return { line: currentIndex, character: position - originalTextOffsets[currentIndex].startPosition };
            }
            if (position < originalTextOffsets[currentIndex].startPosition) {
                upperIndex = currentIndex - 1;
            } else {
                lowerIndex = currentIndex + 1;
            }
        }
        return defaultPosition;
    }

    public addPreprocessingOffset(newPo: PreprocessingOffset): void {
        for (const po of this.preprocessingOffsets) {
            po.afterEndPosition = this.updatePosition(po.afterEndPosition, newPo);
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
            dc.afterEndPosition = this.updatePosition(dc.afterEndPosition, newPo);
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

    private updateOffsetAndChildren(rwc: RangeWithChildren, po: PreprocessingOffset): void {
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

    public getIncludeStatementAtPath(position: Position): IncludeStatement | null {
        return (
            this.includeStatements.find(
                (is) => is.includerUri === this.uri && rangeContains(is.pathOriginalRange, position)
            ) ?? null
        );
    }

    public getIncludeContextAt(position: number): IncludeContext | null {
        return this.includeContexts.find((ic) => ic.startPosition <= position && position <= ic.endPosition) ?? null;
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

    private getIncludeContext(ic: IncludeContext, position: number): IncludeContext | null {
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
        return this.macroContexts.find((mc) => mc.startPosition <= position && position < mc.endPosition) ?? null;
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

    private getMacroContext(mc: MacroContext, position: number): MacroContext | null {
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

    private getDefineContext(dc: DefineContext, position: number): DefineContext | null {
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

    public getMacroStatement(name: string, position: number): MacroStatement | null {
        return this.macroStatements.find((ms) => ms.name === name && ms.position <= position) ?? null;
    }

    public isInHlslBlock(position: Position): boolean {
        return this.hlslBlocks.some((hb) => hb.isVisible && rangeContains(hb.originalRange, position));
    }
}
