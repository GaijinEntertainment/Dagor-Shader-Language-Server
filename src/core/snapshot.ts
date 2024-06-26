import { Diagnostic, DocumentUri, Position, Range } from 'vscode-languageserver';

import { dshlFunctions } from '../helper/dshl-info';
import {
    containsRange,
    defaultPosition,
    defaultRange,
    isBeforeOrEqual,
    isIntervalContains,
    rangeContains,
    rangesEqual,
} from '../helper/helper';
import { Scope } from '../helper/scope';
import { BlockDeclaration } from '../interface/block/block-declaration';
import { BlockUsage } from '../interface/block/block-usage';
import { ColorPickerInfo } from '../interface/color-picker-info';
import { DefineContext } from '../interface/define-context';
import { DefineStatement } from '../interface/define-statement';
import { ElementRange } from '../interface/element-range';
import { ExpressionRange } from '../interface/expression-range';
import { FunctionDeclaration } from '../interface/function/function-declaration';
import { FunctionUsage } from '../interface/function/function-usage';
import { IntrinsicFunction } from '../interface/function/intrinsic-function';
import { HlslBlock } from '../interface/hlsl-block';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeStatement } from '../interface/include/include-statement';
import { IntervalDeclaration } from '../interface/interval-declaration';
import { Macro } from '../interface/macro/macro';
import { MacroContext } from '../interface/macro/macro-context';
import { MacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroParameter } from '../interface/macro/macro-parameter';
import { MacroUsage } from '../interface/macro/macro-usage';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { RangeWithChildren } from '../interface/range-with-children';
import { ShaderBlock } from '../interface/shader-block';
import { ShaderDeclaration } from '../interface/shader/shader-declaration';
import { ShaderUsage } from '../interface/shader/shader-usage';
import { SnapshotVersion } from '../interface/snapshot-version';
import { EnumDeclaration } from '../interface/type/enum-declaration';
import { EnumMemberDeclaration } from '../interface/type/enum-member-declaration';
import { EnumMemberUsage } from '../interface/type/enum-member-usage';
import { EnumUsage } from '../interface/type/enum-usage';
import { TypeDeclaration } from '../interface/type/type-declaration';
import { TypeUsage } from '../interface/type/type-usage';
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
    public rootScope: Scope;
    public preprocessingOffsets: PreprocessingOffset[] = [];
    public diagnostics: Diagnostic[] = [];
    public expressionRanges: ExpressionRange[] = [];
    public intrinsicFunctions: IntrinsicFunction[] = [];

    public constructor(version: SnapshotVersion, uri: DocumentUri, text: string, isPredefined = false) {
        this.version = version;
        this.uri = uri;
        this.originalText = text;
        this.isPredefined = isPredefined;
        this.computeOriginalTextOffsets();
        const lastLine = this.originalTextOffsets[this.originalTextOffsets.length - 1];
        this.rootScope = {
            shaderDeclarations: [],
            shaderUsages: [],
            typeDeclarations: [],
            typeUsages: [],
            enumDeclarations: [],
            enumUsages: [],
            enumMemberDeclarations: [],
            enumMemberUsages: [],
            variableDeclarations: [],
            variableUsages: [],
            functionDeclarations: [],
            functionUsages: [],
            blockUsages: [],
            colorPickerInfos: [],
            originalRange: {
                start: { line: 0, character: 0 },
                end: {
                    line: this.originalTextOffsets.length,
                    character: lastLine.endPosition - lastLine.startPosition,
                },
            },
            children: [],
            isVisible: true,
            hlslBlocks: [],
            preshaders: [],
        };
        this.rootScope.functionDeclarations = dshlFunctions.map((fi) => ({
            name: fi.name,
            type: fi.type,
            originalRange: defaultRange,
            nameOriginalRange: defaultRange,
            parameters: fi.parameters.map((p) => ({
                name: p.name,
                type: p.type,
                description: p.description,
            })),
            usages: [],
            isVisible: false,
            uri: '',
            isHlsl: false,
            isBuiltIn: true,
        }));
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

    public getMacroWith(name: string): Macro {
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

    public getMacroContextAt(position: number): MacroContext | null {
        return this.macroContexts.find((mc) => isIntervalContains(mc.startPosition, mc.endPosition, position)) ?? null;
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

    public getHlslBlockAt(position: number): HlslBlock | null {
        return this.hlslBlocks.find((hb) => isIntervalContains(hb.startPosition, hb.endPosition, position)) ?? null;
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

    public isInDefineContext(position: number): boolean {
        return this.defineContexts.some((dc) => dc.startPosition <= position && position < dc.afterEndPosition);
    }

    public getDefineContextAtOffset(position: number): DefineContext | null {
        return (
            this.defineContexts.find((dc) => isIntervalContains(dc.startPosition, dc.afterEndPosition, position)) ??
            null
        );
    }

    public isInDirective(position: number): boolean {
        return this.directives.some((d) => isIntervalContains(d.startPosition, d.endPosition, position));
    }

    public getTypeUsageAt(position: Position): TypeUsage | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const tu = scope.typeUsages.find((tu) => tu.isVisible && rangeContains(tu.originalRange, position));
            if (tu) {
                return tu;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getEnumUsageAt(position: Position): EnumUsage | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const eu = scope.enumUsages.find((eu) => eu.isVisible && rangeContains(eu.originalRange, position));
            if (eu) {
                return eu;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getVariableUsageAt(position: Position): VariableUsage | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const vu = scope.variableUsages.find((vu) => vu.isVisible && rangeContains(vu.originalRange, position));
            if (vu) {
                return vu;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getShaderUsageAt(position: Position): ShaderUsage | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const vu = scope.shaderUsages.find((vu) => vu.isVisible && rangeContains(vu.originalRange, position));
            if (vu) {
                return vu;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getFunctionUsageAt(position: Position): FunctionUsage | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const fu = scope.functionUsages.find((fu) => fu.isVisible && rangeContains(fu.nameOriginalRange, position));
            if (fu) {
                return fu;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getBlockUsageAt(position: Position): BlockUsage | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const bu = scope.blockUsages.find((bu) => bu.isVisible && rangeContains(bu.originalRange, position));
            if (bu) {
                return bu;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getFunctionUsagesIn(range: Range): FunctionUsage[] {
        const result: FunctionUsage[] = [];
        this.addFunctionUsage(result, this.rootScope, range);
        return result;
    }

    private addFunctionUsage(result: FunctionUsage[], scope: Scope, range: Range): void {
        result.push(
            ...scope.functionUsages.filter(
                (fu) =>
                    fu.isVisible &&
                    (rangeContains(range, fu.originalRange.start) || rangeContains(range, fu.originalRange.end))
            )
        );
        for (const child of scope.children) {
            if (rangeContains(range, child.originalRange.start) || rangeContains(range, child.originalRange.end)) {
                this.addFunctionUsage(result, child, range);
            }
        }
    }

    public getFunctionUsageParameterListAt(position: Position): FunctionUsage | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const fu = scope.functionUsages.find(
                (fu) => fu.isVisible && rangeContains(fu.parameterListOriginalRange, position)
            );
            if (fu) {
                return fu;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getTypeDeclarationAt(position: Position): TypeDeclaration | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            let td =
                scope.typeDeclarations.find((td) => td.isVisible && rangeContains(td.nameOriginalRange, position)) ??
                null;
            if (td) {
                return td;
            }
            td = this.getEmbeddedTypeDeclaration(scope.typeDeclarations, position);
            if (td) {
                return td;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    private getEmbeddedTypeDeclaration(tds: TypeDeclaration[], position: Position): TypeDeclaration | null {
        for (const td of tds) {
            let etd =
                td.embeddedTypes.find(
                    (etd) => etd.isVisible && rangeContains(etd.nameOriginalRange ?? etd.originalRange, position)
                ) ?? null;
            if (etd) {
                return etd;
            }
            etd = this.getEmbeddedTypeDeclaration(td.embeddedTypes, position);
            if (etd) {
                return etd;
            }
        }
        return null;
    }

    public getEnumDeclarationAt(position: Position): EnumDeclaration | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            let ed =
                scope.enumDeclarations.find(
                    (ed) => ed.isVisible && rangeContains(ed.nameOriginalRange ?? ed.originalRange, position)
                ) ?? null;
            if (ed) {
                return ed;
            }
            ed = this.getEmbeddedEnumDeclaration(scope.typeDeclarations, position);
            if (ed) {
                return ed;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    private getEmbeddedEnumDeclaration(tds: TypeDeclaration[], position: Position): EnumDeclaration | null {
        for (const td of tds) {
            let ed =
                td.embeddedEnums.find(
                    (ed) => ed.isVisible && rangeContains(ed.nameOriginalRange ?? ed.originalRange, position)
                ) ?? null;
            if (ed) {
                return ed;
            }
            ed = this.getEmbeddedEnumDeclaration(td.embeddedTypes, position);
            if (ed) {
                return ed;
            }
        }
        return null;
    }

    public getMacroDeclarationAt(position: Position): MacroDeclaration | null {
        return this.macroDeclarations.find((md) => rangeContains(md.nameOriginalRange, position)) ?? null;
    }

    public getMacroUsageAt(position: Position): MacroUsage | null {
        return this.macroUsages.find((mu) => mu.isVisible && rangeContains(mu.nameOriginalRange, position)) ?? null;
    }

    public getDefineStatementAt(position: Position): DefineStatement | null {
        const macroSnapshot = this.getSnapshotForMacroDefinition(position);
        const ds = macroSnapshot.defineStatements.find(
            (ds) => ds.isVisible && rangeContains(ds.nameOriginalRange, position)
        );
        if (ds) {
            return ds.realDefine ?? ds;
        } else {
            return null;
        }
    }

    public getDefineContextAt(position: Position): DefineContext | null {
        return this.defineContexts.find((dc) => dc.isVisible && rangeContains(dc.nameOriginalRange, position)) ?? null;
    }

    public getEnumMemberDeclarationAt(position: Position): EnumMemberDeclaration | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const emd = scope.enumMemberDeclarations.find(
                (emd) => emd.isVisible && rangeContains(emd.nameOriginalRange, position)
            );
            if (emd) {
                return emd;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getEnumMemberUsageAt(position: Position): EnumMemberUsage | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const emu = scope.enumMemberUsages.find(
                (emu) => emu.isVisible && rangeContains(emu.originalRange, position)
            );
            if (emu) {
                return emu;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getFunctionDeclarationAt(position: Position): FunctionDeclaration | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const fd =
                scope.children
                    .map((sc) => sc.functionDeclaration)
                    .find(
                        (fd) => fd && fd.isVisible && rangeContains(fd.nameOriginalRange ?? fd.originalRange, position)
                    ) ?? null;
            if (fd) {
                return fd;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getColorPickerInfoAt(range: Range): ColorPickerInfo | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const cpi = scope.colorPickerInfos.find((cpi) => rangesEqual(cpi.originalRange, range)) ?? null;
            if (cpi) {
                return cpi;
            }
            scope = scope.children.find((c) => c.isVisible && containsRange(c.originalRange, range)) ?? null;
        }
        return null;
    }

    public getVariableDeclarationAt(position: Position): VariableDeclaration | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            let vd =
                scope.variableDeclarations.find(
                    (vd) => vd.isVisible && rangeContains(vd.nameOriginalRange, position)
                ) ?? null;
            if (vd) {
                return vd;
            }
            vd =
                scope.typeDeclarations
                    .flatMap((td) => td.members)
                    .find((vd) => vd.isVisible && rangeContains(vd.nameOriginalRange, position)) ?? null;
            if (vd) {
                return vd;
            }
            vd = this.getEmbeddedVariableDeclaration(scope.typeDeclarations, position);
            if (vd) {
                return vd;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    private getEmbeddedVariableDeclaration(tds: TypeDeclaration[], position: Position): VariableDeclaration | null {
        for (const td of tds) {
            let emd =
                td.embeddedTypes
                    .flatMap((etd) => etd.members)
                    .find((ed) => ed.isVisible && rangeContains(ed.nameOriginalRange ?? ed.originalRange, position)) ??
                null;
            if (emd) {
                return emd;
            }
            emd = this.getEmbeddedVariableDeclaration(td.embeddedTypes, position);
            if (emd) {
                return emd;
            }
        }
        return null;
    }

    public getShaderDeclarationAt(position: Position): ShaderDeclaration | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const sd = scope.shaderDeclarations.find(
                (sd) => sd.isVisible && rangeContains(sd.nameOriginalRange, position)
            );
            if (sd) {
                return sd;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getIntervalDeclarationAt(position: Position): IntervalDeclaration | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const id = scope.variableDeclarations.find(
                (vd) => vd.interval && vd.interval.isVisible && rangeContains(vd.interval.nameOriginalRange, position)
            )?.interval;
            if (id) {
                return id;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getBlockDeclarationAt(position: Position): BlockDeclaration | null {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            if (
                scope.blockDeclaration &&
                scope.blockDeclaration.isVisible &&
                rangeContains(scope.blockDeclaration.nameOriginalRange, position)
            ) {
                return scope.blockDeclaration;
            }
            scope = scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
        }
        return null;
    }

    public getVariableDeclarationFor(name: string, position: Position, onlyRoot = false): VariableDeclaration | null {
        let scope: Scope | null = onlyRoot ? this.rootScope : this.getScopeAt(position);
        while (scope) {
            const vd = scope.variableDeclarations.find(
                (vd) => isBeforeOrEqual(vd.originalRange.end, position) && vd.name === name
            );
            if (vd) {
                return vd;
            }
            for (const hb of scope.hlslBlocks) {
                const vd = hb.variableDeclarations.find(
                    (vd) => isBeforeOrEqual(vd.originalRange.end, position) && vd.name === name
                );
                if (vd) {
                    return vd;
                }
            }
            for (const psb of scope.preshaders) {
                const vd = psb.variableDeclarations.find(
                    (vd) => isBeforeOrEqual(vd.originalRange.end, position) && vd.name === name
                );
                if (vd) {
                    return vd;
                }
            }
            if (onlyRoot) {
                return null;
            }
            scope = scope.parent ?? null;
        }
        return null;
    }

    public getShaderDeclarationFor(name: string, position: Position, onlyRoot = false): ShaderDeclaration | null {
        let scope: Scope | null = onlyRoot ? this.rootScope : this.getScopeAt(position);
        while (scope) {
            const sd = scope.shaderDeclarations.find(
                (sd) => isBeforeOrEqual(sd.nameOriginalRange.end, position) && sd.name === name
            );
            if (sd) {
                return sd;
            }
            if (onlyRoot) {
                return null;
            }
            scope = scope.parent ?? null;
        }
        return null;
    }

    public getBlockDeclarationFor(name: string, position: Position, onlyRoot = false): BlockDeclaration | null {
        let scope: Scope | null = onlyRoot ? this.rootScope : this.getScopeAt(position);
        while (scope) {
            const bd = scope.children
                .map((s) => s.blockDeclaration)
                .find((bd) => bd && bd.name === name && isBeforeOrEqual(bd.nameOriginalRange.end, position));
            if (bd) {
                return bd;
            }
            if (onlyRoot) {
                return null;
            }
            scope = scope.parent ?? null;
        }
        return null;
    }

    public getTypeDeclarationFor(name: string, position: Position, onlyRoot = false): TypeDeclaration | null {
        let scope: Scope | null = onlyRoot ? this.rootScope : this.getScopeAt(position);
        while (scope) {
            const td = scope.typeDeclarations.find(
                (td) => td && td.name === name && isBeforeOrEqual(td.nameOriginalRange.end, position)
            );
            if (td) {
                return td;
            }
            for (const hb of scope.hlslBlocks) {
                const td = hb.typeDeclarations.find(
                    (td) => isBeforeOrEqual(td.originalRange.end, position) && td.name === name
                );
                if (td) {
                    return td;
                }
            }
            if (onlyRoot) {
                return null;
            }
            scope = scope.parent ?? null;
        }
        return null;
    }

    public getEnumDeclarationFor(name: string, position: Position, onlyRoot = false): EnumDeclaration | null {
        let scope: Scope | null = onlyRoot ? this.rootScope : this.getScopeAt(position);
        while (scope) {
            const ed = scope.enumDeclarations.find(
                (ed) =>
                    ed &&
                    ed.nameOriginalRange &&
                    ed.name === name &&
                    isBeforeOrEqual(ed.nameOriginalRange.end, position)
            );
            if (ed) {
                return ed;
            }
            for (const hb of scope.hlslBlocks) {
                const ed = hb.enumDeclarations.find(
                    (ed) => isBeforeOrEqual(ed.originalRange.end, position) && ed.name === name
                );
                if (ed) {
                    return ed;
                }
            }
            if (onlyRoot) {
                return null;
            }
            scope = scope.parent ?? null;
        }
        return null;
    }

    public getEnumMemberDeclarationFor(
        name: string,
        position: Position,
        onlyRoot = false
    ): EnumMemberDeclaration | null {
        let scope: Scope | null = onlyRoot ? this.rootScope : this.getScopeAt(position);
        while (scope) {
            const emd = scope.enumDeclarations
                .filter((ed) => !ed.isClass)
                .flatMap((ed) => ed.members)
                .find((emd) => emd && emd.name === name && isBeforeOrEqual(emd.nameOriginalRange.end, position));
            if (emd) {
                return emd;
            }
            for (const hb of scope.hlslBlocks) {
                const emd = hb.enumDeclarations
                    .filter((ed) => !ed.isClass)
                    .flatMap((ed) => ed.members)
                    .find((emd) => emd && emd.name === name && isBeforeOrEqual(emd.nameOriginalRange.end, position));
                if (emd) {
                    return emd;
                }
            }
            if (onlyRoot) {
                return null;
            }
            scope = scope.parent ?? null;
        }
        return null;
    }

    public getFunctionDeclarationFor(name: string, position: Position, onlyRoot = false): FunctionDeclaration | null {
        let scope: Scope | null = onlyRoot ? this.rootScope : this.getScopeAt(position);
        while (scope) {
            const fd = scope.children
                .map((sc) => sc.functionDeclaration)
                .find((fd) => fd && fd.name === name && isBeforeOrEqual(fd.nameOriginalRange.end, position));
            if (fd) {
                return fd;
            }
            for (const hb of scope.hlslBlocks) {
                if (
                    hb.functionDeclaration &&
                    hb.functionDeclaration.name === name &&
                    isBeforeOrEqual(hb.functionDeclaration.nameOriginalRange.end, position)
                ) {
                    return hb.functionDeclaration;
                }
            }
            if (onlyRoot) {
                return null;
            }
            scope = scope.parent ?? null;
        }
        return null;
    }

    public getTypeDeclarationsInScope(position: Position): TypeDeclaration[] {
        const result: TypeDeclaration[] = [];
        let scope: Scope | null = this.getScopeAt(position);
        while (scope) {
            for (const td of scope.typeDeclarations) {
                if (isBeforeOrEqual(td.originalRange.end, position) && result.every((r) => r.name !== td.name)) {
                    result.push(td);
                }
            }
            for (const hb of scope.hlslBlocks) {
                for (const td of hb.typeDeclarations) {
                    if (isBeforeOrEqual(td.originalRange.end, position) && result.every((r) => r.name !== td.name)) {
                        result.push(td);
                    }
                }
            }
            scope = scope.parent ?? null;
        }
        return result;
    }

    public getEnumDeclarationsInScope(position: Position): EnumDeclaration[] {
        const result: EnumDeclaration[] = [];
        let scope: Scope | null = this.getScopeAt(position);
        while (scope) {
            for (const ed of scope.enumDeclarations) {
                if (isBeforeOrEqual(ed.originalRange.end, position) && result.every((r) => r.name !== ed.name)) {
                    result.push(ed);
                }
            }
            for (const hb of scope.hlslBlocks) {
                for (const td of hb.enumDeclarations) {
                    if (isBeforeOrEqual(td.originalRange.end, position) && result.every((r) => r.name !== td.name)) {
                        result.push(td);
                    }
                }
            }
            scope = scope.parent ?? null;
        }
        return result;
    }

    public getVariableDeclarationsInScope(position: Position, hlsl: boolean): VariableDeclaration[] {
        const result: VariableDeclaration[] = [];
        let scope: Scope | null = this.getScopeAt(position);
        while (scope) {
            for (const vd of scope.variableDeclarations) {
                if (
                    vd.isHlsl === hlsl &&
                    !result.some((r) => r.name === vd.name) &&
                    isBeforeOrEqual(vd.originalRange.end, position)
                ) {
                    result.push(vd);
                }
            }
            for (const hb of scope.hlslBlocks) {
                for (const vd of hb.variableDeclarations) {
                    if (isBeforeOrEqual(vd.originalRange.end, position) && result.every((r) => r.name !== vd.name)) {
                        result.push(vd);
                    }
                }
            }
            for (const psb of scope.preshaders) {
                for (const vd of psb.variableDeclarations) {
                    if (isBeforeOrEqual(vd.originalRange.end, position) && result.every((r) => r.name !== vd.name)) {
                        result.push(vd);
                    }
                }
            }
            scope = scope.parent ?? null;
        }
        return result;
    }

    public getFunctionDeclarationsInScope(position: Position): FunctionDeclaration[] {
        const result: FunctionDeclaration[] = [];
        let scope: Scope | null = this.getScopeAt(position);
        while (scope) {
            for (const fd of scope.functionDeclarations) {
                if (
                    fd.isHlsl &&
                    isBeforeOrEqual(fd.originalRange.end, position) &&
                    result.every((r) => r.name !== fd.name)
                ) {
                    result.push(fd);
                }
            }
            for (const hb of scope.hlslBlocks) {
                for (const fd of hb.functionDeclarations) {
                    if (
                        fd.isHlsl &&
                        isBeforeOrEqual(fd.originalRange.end, position) &&
                        result.every((r) => r.name !== fd.name)
                    ) {
                        result.push(fd);
                    }
                }
            }
            scope = scope.parent ?? null;
        }
        return result;
    }

    public getShaderDeclarationsInScope(position: Position): ShaderDeclaration[] {
        const result: ShaderDeclaration[] = [];
        let scope: Scope | null = this.getScopeAt(position);
        while (scope) {
            for (const sd of scope.shaderDeclarations) {
                if (isBeforeOrEqual(sd.nameOriginalRange.end, position) && result.every((r) => r.name !== sd.name)) {
                    result.push(sd);
                }
            }
            scope = scope.parent ?? null;
        }
        return result;
    }

    public getBlockDeclarationsInScope(position: Position): BlockDeclaration[] {
        const result: BlockDeclaration[] = [];
        let scope: Scope | null = this.getScopeAt(position);
        while (scope) {
            const bds = scope.children
                .map((s) => s.blockDeclaration)
                .filter((bd) => bd && isBeforeOrEqual(bd.nameOriginalRange.end, position)) as BlockDeclaration[];
            for (const bd of bds) {
                if (result.every((r) => r.name !== bd.name)) {
                    result.push(bd);
                }
            }
            scope = scope.parent ?? null;
        }
        return result;
    }

    public getAllVariableDeclarations(): VariableDeclaration[] {
        const result: VariableDeclaration[] = [];
        this.addVariableDeclarations(result, this.rootScope);
        return result;
    }

    private addVariableDeclarations(result: VariableDeclaration[], scope: Scope): void {
        result.push(...scope.variableDeclarations.filter((vd) => vd.isVisible));
        for (const child of scope.children) {
            this.addVariableDeclarations(result, child);
        }
    }

    public getAllTypeDeclarations(): TypeDeclaration[] {
        const result: TypeDeclaration[] = [];
        this.addTypeDeclarations(result, this.rootScope);
        return result;
    }

    private addTypeDeclarations(result: TypeDeclaration[], scope: Scope): void {
        result.push(...scope.typeDeclarations.filter((vd) => vd.isVisible));
        for (const child of scope.children) {
            this.addTypeDeclarations(result, child);
        }
    }

    public getAllEnumDeclarations(): EnumDeclaration[] {
        const result: EnumDeclaration[] = [];
        this.addEnumDeclarations(result, this.rootScope);
        return result;
    }

    private addEnumDeclarations(result: EnumDeclaration[], scope: Scope): void {
        result.push(...scope.enumDeclarations.filter((ed) => ed.isVisible));
        for (const child of scope.children) {
            this.addEnumDeclarations(result, child);
        }
    }

    public getAllColorPickerInfos(): ColorPickerInfo[] {
        const result: ColorPickerInfo[] = [];
        this.addColorPickerInfos(result, this.rootScope);
        return result;
    }

    private addColorPickerInfos(result: ColorPickerInfo[], scope: Scope): void {
        result.push(...scope.colorPickerInfos);
        for (const child of scope.children) {
            this.addColorPickerInfos(result, child);
        }
    }

    public getMacro(position: Position): Macro | null {
        const md = this.getMacroDeclarationAt(position);
        if (md) {
            return md.macro;
        }
        const mu = this.getMacroUsageAt(position);
        if (mu) {
            return mu.macro;
        }
        return null;
    }

    public getDefineStatement(position: Position): DefineStatement | null {
        const ds = this.getDefineStatementAt(position);
        if (ds) {
            return ds;
        }
        const dc = this.getDefineContextAt(position);
        if (dc) {
            return dc.define.realDefine ?? dc.define;
        }
        return null;
    }

    private getSnapshotForMacroDefinition(position: Position): Snapshot {
        const md = this.macroDeclarations.find((md) => rangeContains(md.originalRange, position));
        return md ? md.contentSnapshot : this;
    }

    public getMacroParameter(position: Position, uri: DocumentUri): MacroParameter | null {
        const md =
            this.macroDeclarations.find((md) => md.uri === uri && rangeContains(md.originalRange, position)) ?? null;
        if (!md) {
            return null;
        }
        return (
            md.parameters.find(
                (mp) =>
                    rangeContains(mp.originalRange, position) ||
                    mp.usages.some((mpu) => rangeContains(mpu.originalRange, position))
            ) ?? null
        );
    }

    public getTypeDeclaration(position: Position): TypeDeclaration | null {
        const td = this.getTypeDeclarationAt(position);
        if (td) {
            return td;
        }
        const tu = this.getTypeUsageAt(position);
        if (tu) {
            return tu.declaration;
        }
        return null;
    }

    public getEnumDeclaration(position: Position): EnumDeclaration | null {
        const ed = this.getEnumDeclarationAt(position);
        if (ed) {
            return ed;
        }
        const eu = this.getEnumUsageAt(position);
        if (eu) {
            return eu.declaration;
        }
        return null;
    }

    public getEnumMemberDeclaration(position: Position): EnumMemberDeclaration | null {
        const emd = this.getEnumMemberDeclarationAt(position);
        if (emd) {
            return emd;
        }
        const emu = this.getEnumMemberUsageAt(position);
        if (emu) {
            return emu.declaration;
        }
        return null;
    }

    public getVariableDeclaration(position: Position): VariableDeclaration | null {
        const vd = this.getVariableDeclarationAt(position);
        if (vd) {
            return vd;
        }
        const vu = this.getVariableUsageAt(position);
        if (vu) {
            return vu.declaration;
        }
        const id = this.getIntervalDeclarationAt(position);
        if (id) {
            return id.variable;
        }
        return null;
    }

    public getFunctionDeclaration(position: Position): FunctionDeclaration | null {
        const fd = this.getFunctionDeclarationAt(position);
        if (fd) {
            return fd;
        }
        const fu = this.getFunctionUsageAt(position);
        if (fu) {
            return fu.declaration ?? null;
        }
        return null;
    }

    public getShaderDeclaration(position: Position): ShaderDeclaration | null {
        const sd = this.getShaderDeclarationAt(position);
        if (sd) {
            return sd;
        }
        const su = this.getShaderUsageAt(position);
        if (su) {
            return su.declaration;
        }
        return null;
    }

    public getBlockDeclaration(position: Position): BlockDeclaration | null {
        const bd = this.getBlockDeclarationAt(position);
        if (bd) {
            return bd;
        }
        const bu = this.getBlockUsageAt(position);
        if (bu) {
            return bu.declaration;
        }
        return null;
    }

    private getScopeAt(position: Position): Scope {
        let scope: Scope | null = this.rootScope;
        while (scope) {
            const child: Scope | null =
                scope.children.find((c) => c.isVisible && rangeContains(c.originalRange, position)) ?? null;
            if (child) {
                scope = child;
            } else {
                return scope;
            }
        }
        return this.rootScope;
    }
}
