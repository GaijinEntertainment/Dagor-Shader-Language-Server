import { DocumentUri, Position, Range } from 'vscode-languageserver';

import { defaultPosition, isIntervalContains, rangeContains } from '../helper/helper';
import { DefineContext } from '../interface/define-context';
import { DefineStatement } from '../interface/define-statement';
import { ElementRange } from '../interface/element-range';
import { HlslBlock } from '../interface/hlsl-block';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeStatement } from '../interface/include/include-statement';
import { Macro } from '../interface/macro/macro';
import { MacroContext } from '../interface/macro/macro-context';
import { MacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroUsage } from '../interface/macro/macro-usage';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { RangeWithChildren } from '../interface/range-with-children';
import { ShaderBlock } from '../interface/shader-block';
import { SnapshotVersion } from '../interface/snapshot-version';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';
import { getPredefineSnapshot } from '../processor/include-processor';
import { HLSLI_EXTENSION, HLSL_EXTENSION } from './constant';

export class Snapshot {
    public readonly version: SnapshotVersion;
    public readonly uri: DocumentUri;
    public readonly originalText: string;
    public readonly isPredefined: boolean;
    private originalTextOffsets: ElementRange[] = [];
    public text = '';
    public cleanedText = '';
    public preprocessedText = '';
    public includeStatements: IncludeStatement[] = [];
    public includeContexts: IncludeContext[] = [];
    public defineStatements: DefineStatement[] = [];
    public macros: Macro[] = [];
    public macroDeclarations: MacroDeclaration[] = [];
    public macroContexts: MacroContext[] = [];
    public macroUsages: MacroUsage[] = [];
    public defineContexts: DefineContext[] = [];
    public stringRanges: ElementRange[] = [];
    public ifRanges: Range[] = [];
    public directives: ElementRange[] = [];
    public shaderBlocks: ShaderBlock[] = [];
    public globalHlslBlocks: HlslBlock[] = [];
    public hlslBlocks: HlslBlock[] = [];
    public noCodeCompletionRanges: Range[] = [];
    public foldingRanges: Range[] = [];
    public variableDeclarations: VariableDeclaration[] = [];
    public variableUsages: VariableUsage[] = [];
    public preprocessingOffsets: PreprocessingOffset[] = [];

    public constructor(version: SnapshotVersion, uri: DocumentUri, text: string, isPredefined = false) {
        this.version = version;
        this.uri = uri;
        this.originalText = text;
        this.isPredefined = isPredefined;
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
        position = this.getOriginalOffsetWithIncludeContext(position, start, icc);
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
                isIntervalContains(
                    originalTextOffsets[currentIndex].startPosition,
                    originalTextOffsets[currentIndex].endPosition,
                    position
                )
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
        for (const md of this.macroDeclarations) {
            md.position = this.updatePosition(md.position, newPo);
            md.endPosition = this.updatePosition(md.endPosition, newPo);
        }
        for (const mc of this.macroContexts) {
            this.updateOffsetAndChildren(mc, newPo);
        }
        for (const ds of this.defineStatements) {
            ds.position = this.updatePosition(ds.position, newPo);
            ds.endPosition = this.updatePosition(ds.endPosition, newPo);
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
        for (const sb of this.shaderBlocks) {
            sb.startPosition = this.updatePosition(sb.startPosition, newPo);
            sb.endPosition = this.updatePosition(sb.endPosition, newPo);
        }
        for (const d of this.directives) {
            d.startPosition = this.updatePosition(d.startPosition, newPo);
            d.endPosition = this.updatePosition(d.endPosition, newPo);
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

    public isInIncludeContext(position: number): boolean {
        return this.includeContexts.some((ic) => isIntervalContains(ic.startPosition, ic.endPosition, position));
    }

    public getIncludeContextAt(position: number): IncludeContext | null {
        return (
            this.includeContexts.find((ic) => isIntervalContains(ic.startPosition, ic.endPosition, position)) ?? null
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

    private getIncludeContext(ic: IncludeContext, position: number): IncludeContext | null {
        if (isIntervalContains(ic.startPosition, ic.endPosition, position)) {
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

    public getMacro(name: string): Macro {
        let macro = this.macros.find((m) => m.name === name);
        if (!macro) {
            macro = {
                name,
                declarations: [],
                usages: [],
            };
            this.macros.push(macro);
        }
        return macro;
    }

    public isInMacroContext(position: number): boolean {
        return this.macroContexts.some((mc) => mc.startPosition <= position && position < mc.endPosition);
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

    public isInHlslBlock(position: Position): boolean {
        return (
            this.hlslBlocks.some((hb) => hb.isVisible && rangeContains(hb.originalRange, position)) ||
            this.macroDeclarations.some((md) => md.contentSnapshot.isInHlslBlock(position))
        );
    }

    public getDefinition(name: string, position: number): DefineStatement | null {
        return this.getDefineStatements(position).find((ds) => ds.name === name) ?? null;
    }

    public getDefineStatements(position: number): DefineStatement[] {
        const result: DefineStatement[] = [];
        const predefineSnapshot = getPredefineSnapshot();
        if (predefineSnapshot) {
            result.push(...predefineSnapshot.defineStatements);
        }
        if (this.uri.endsWith(HLSL_EXTENSION) || this.uri.endsWith(HLSLI_EXTENSION)) {
            result.push(...this.defineStatements.filter((ds) => this.isDefineAvailable(ds, position)));
        } else {
            const md = this.macroDeclarations.find((md) => isIntervalContains(md.position, md.endPosition, position));
            const definesSnapshot = md?.contentSnapshot ?? this;
            const hb =
                definesSnapshot.hlslBlocks.find((hb) =>
                    isIntervalContains(hb.startPosition, hb.endPosition, position)
                ) ?? null;
            if (hb) {
                const shaderBlock = definesSnapshot.shaderBlocks.find((sb) =>
                    isIntervalContains(sb.startPosition, sb.endPosition, position)
                );
                if (shaderBlock) {
                    result.push(...this.getDefineStatementsInHlslBlocks(shaderBlock.hlslBlocks, position, hb.stage));
                }
                result.push(
                    ...this.getDefineStatementsInHlslBlocks(definesSnapshot.globalHlslBlocks, position, hb.stage)
                );
            }
            if (md && hb) {
                result.push(...this.getDefineStatementsInHlslBlocks(this.globalHlslBlocks, md.position, hb.stage));
            }
        }
        return result;
    }

    private getDefineStatementsInHlslBlocks(
        hbs: HlslBlock[],
        position: number,
        stage: string | null
    ): DefineStatement[] {
        return hbs
            .filter(
                (hb) =>
                    hb.startPosition <= position &&
                    position <= hb.endPosition &&
                    (hb.stage === null || hb.stage === stage)
            )
            .flatMap((hb) => hb.defineStatements)
            .filter((ds) => this.isDefineAvailable(ds, position));
    }

    private isDefineAvailable(ds: DefineStatement, position: number): boolean {
        return ds.endPosition <= position && (!ds.undefPosition || position <= ds.undefPosition);
    }

    public isInDirective(position: number): boolean {
        return this.directives.some((d) => isIntervalContains(d.startPosition, d.endPosition, position));
    }
}
