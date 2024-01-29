import { DocumentUri, Position, Range } from 'vscode-languageserver';

import { Snapshot } from '../core/snapshot';
import { defaultRange } from '../helper/helper';
import { ElementRange } from '../interface/element-range';
import { HlslBlock } from '../interface/hlsl-block';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeResult } from '../interface/include/include-result';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { getMacroDeclaration, hasMacroDeclarationBefore, isDeclarationAlreadyAdded } from '../interface/macro/macro';
import { MacroArguments } from '../interface/macro/macro-arguments';
import { MacroContext } from '../interface/macro/macro-context';
import { MacroDeclaration } from '../interface/macro/macro-declaration';
import { MacroParameter } from '../interface/macro/macro-parameter';
import { MacroType } from '../interface/macro/macro-type';
import { MacroUsage } from '../interface/macro/macro-usage';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { shaderStageKeywordToEnum } from '../interface/shader-stage';
import { invalidVersion } from '../interface/snapshot-version';
import { TextEdit } from '../interface/text-edit';
import { HlslBlockProcesor } from './hlsl-block-processor';
import { getIncludedDocumentUri } from './include-resolver';
import { Preprocessor } from './preprocessor';

export async function preprocessDshl(snapshot: Snapshot): Promise<void> {
    return await new DshlPreprocessor(snapshot, true).preprocess();
}

class DshlPreprocessor {
    private snapshot: Snapshot;
    private isRoot: boolean;

    public constructor(snapshot: Snapshot, isRoot = false) {
        this.snapshot = snapshot;
        this.isRoot = isRoot;
    }

    public async preprocess(): Promise<void> {
        this.preprocessMacros();
        this.findHlslBlocks(this.snapshot.text);
        await this.preprocessIncludes([]);
        this.expandMacros();
        this.processMacroContents();
    }

    private async preprocessIncludes(parentUris: DocumentUri[]): Promise<void> {
        const regex = /(?<=^[ \t]*)include(?:_optional)?\s*"(?<path>[^"]*)"/gm;
        let regexResult: RegExpExecArray | null;
        const results: IncludeResult[] = [];
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            if (Preprocessor.isInString(position, this.snapshot)) {
                continue;
            }
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const path = regexResult.groups?.path ?? '';
            const is = this.createIncludeStatement(
                beforeEndPosition,
                IncludeType.DSHL,
                path,
                !!parentUris.length,
                this.snapshot
            );
            const snapshot = await this.getInclude(is, [this.snapshot.uri, ...parentUris]);
            results.push({
                snapshot,
                position,
                beforeEndPosition,
                includeStatement: is,
            });
        }
        this.pasteIncludes(results);
    }

    private createIncludeStatement(
        beforeEndPosition: number,
        type: IncludeType,
        path: string,
        isIncluded: boolean,
        snapshot: Snapshot
    ): IncludeStatement {
        const pathOriginalRange = isIncluded
            ? defaultRange
            : Preprocessor.getIncludePathOriginalRange(beforeEndPosition, path, snapshot);
        const originalEndPosition = snapshot.getOriginalPosition(beforeEndPosition, false);
        const is: IncludeStatement = {
            path,
            originalEndPosition,
            pathOriginalRange,
            type,
            includerUri: snapshot.uri,
        };
        // TODO: make it work with HLSL: don't add if it's in a define context
        snapshot.includeStatements.push(is);
        return is;
    }

    private async getInclude(is: IncludeStatement, parentUris: DocumentUri[]): Promise<Snapshot> {
        const uri = await getIncludedDocumentUri(is);
        if (!uri || parentUris.includes(uri)) {
            return new Snapshot(invalidVersion, '', '');
        }
        const snapshot = await Preprocessor.getSnapshot(uri, this.snapshot);
        new Preprocessor(snapshot).clean();
        const dp = new DshlPreprocessor(snapshot);
        dp.preprocessMacros();
        await dp.preprocessIncludes(parentUris);
        dp.expandMacros();
        return snapshot;
    }

    private pasteIncludes(includeResults: IncludeResult[]): void {
        let offset = 0;
        for (const result of includeResults) {
            result.position += offset;
            result.beforeEndPosition += offset;
            const afterEndPosition = result.position + result.snapshot.text.length;
            Preprocessor.changeTextAndAddOffset(
                result.position,
                result.beforeEndPosition,
                afterEndPosition,
                result.snapshot.text,
                this.snapshot
            );
            const ic: IncludeContext = {
                children: [],
                startPosition: result.position,
                localStartPosition: result.position,
                endPosition: afterEndPosition,
                includeStatement: result.includeStatement,
                snapshot: result.snapshot,
                parent: null,
            };
            for (const sr of result.snapshot.stringRanges) {
                sr.startPosition += offset;
                sr.endPosition += offset;
                this.snapshot.stringRanges.push(sr);
            }
            for (const [uri, version] of result.snapshot.version.includedDocumentsVersion.entries()) {
                this.snapshot.version.includedDocumentsVersion.set(uri, version);
            }
            this.updateIncludes(result, ic);
            this.updateMacros(result, ic, offset);
            this.offsetChildren(ic, ic.startPosition);
            offset += result.snapshot.text.length - (result.beforeEndPosition - result.position);
        }
    }

    private updateIncludes(result: IncludeResult, ic: IncludeContext): void {
        this.snapshot.includeContexts.push(ic);
        for (const icc of result.snapshot.includeContexts) {
            ic.children.push(icc);
            icc.parent = ic;
        }
    }

    private updateMacros(result: IncludeResult, ic: IncludeContext, offset: number): void {
        for (const md of result.snapshot.macroDeclarations) {
            md.codeCompletionPosition = ic.includeStatement.originalEndPosition;
            md.position += offset;
            this.snapshot.macroDeclarations.push(md);
        }
        for (const mc of result.snapshot.macroContexts) {
            mc.startPosition += offset;
            mc.endPosition += offset;
            this.offsetChildren(mc, ic.startPosition);
            this.snapshot.macroContexts.push(mc);
        }
        for (const macro of result.snapshot.macros) {
            const m = this.snapshot.macros.find((m) => m.name === macro.name);
            if (m) {
                m.declarations.push(...macro.declarations.filter((md) => !isDeclarationAlreadyAdded(m, md)));
                m.usages.push(...macro.usages);
                for (const md of m.declarations) {
                    md.macro = m;
                }
                for (const mu of m.usages) {
                    mu.macro = m;
                }
            } else {
                this.snapshot.macros.push(macro);
            }
        }
    }

    private offsetChildren(ic: IncludeContext | MacroContext, offset: number): void {
        for (const icc of ic.children) {
            icc.startPosition += offset;
            icc.endPosition += offset;
            this.offsetChildren(icc, offset);
        }
    }

    private preprocessMacros(): void {
        const textEdits: TextEdit[] = [];
        const regex =
            /(?<beforeContent>(?<beforeParameters>\b(?<beforeName>(?:macro|define_macro_if_not_defined)\s+)(?<name>[a-zA-Z_]\w*)\s*\(\s*)(?<parameters>[a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*\s*(,\s*)?)?\))(?<content>(?:[^\r\n]*(?:\r?\n))?(?:^[^\r\n]*(?:\r?\n))*?[^\r\n]*?)\b(?:endmacro)\b/gm;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            if (Preprocessor.isInString(position, this.snapshot)) {
                continue;
            }
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const name = regexResult.groups?.name ?? '';
            const content = regexResult.groups?.content ?? '';
            const contentOffset = position + (regexResult.groups?.beforeContent?.length ?? 0);
            const beforeNameOffset = regexResult.groups?.beforeName?.length ?? 0;
            const nameOriginalRange = this.snapshot.getOriginalRange(
                beforeNameOffset + position,
                beforeNameOffset + position + name.length
            );
            const originalRange = this.snapshot.getOriginalRange(position, beforeEndPosition);
            textEdits.push({
                position,
                beforeEndPosition,
                pasteText: '',
            });
            const parameters = regexResult.groups?.parameters ?? '';
            const parametersOffset = position + (regexResult.groups?.beforeParameters?.length ?? 0);
            const macroParameters = this.getParameters(parameters, parametersOffset);
            if (this.isRoot) {
                this.addIncludesInMacro(content, contentOffset);
                this.findHlslBlocks(content, contentOffset);
                this.addParameterUsages(macroParameters, content, contentOffset);
            }
            this.createMacroDeclaration(
                position,
                originalRange,
                nameOriginalRange,
                contentOffset,
                match,
                name,
                macroParameters,
                content
            );
        }
        Preprocessor.executeTextEdits(textEdits, this.snapshot);
    }

    private getParameters(parameters: string, offset: number): MacroParameter[] {
        const result: MacroParameter[] = [];
        const regex = /\b(?:[a-zA-Z_]\w*)\b/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(parameters))) {
            const position = offset + regexResult.index;
            const match = regexResult[0];
            const endPosition = position + match.length;
            const originalRange = this.snapshot.getOriginalRange(position, endPosition);
            result.push({
                name: match,
                originalRange,
                usages: [],
            });
        }
        return result;
    }

    private addParameterUsages(mps: MacroParameter[], content: string, offset: number): void {
        if (!mps.length) {
            return;
        }
        const macroParameterNames = mps.map((mp) => mp.name).join('|');
        const regex = new RegExp(`\\b(${macroParameterNames})\\b`, 'g');
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(content))) {
            const position = offset + regexResult.index;
            if (Preprocessor.isInString(position, this.snapshot)) {
                continue;
            }
            const match = regexResult[0];
            const endPosition = position + match.length;
            const originalRange = this.snapshot.getOriginalRange(position, endPosition);
            const mp = mps.find((mp) => mp.name === match);
            if (mp) {
                mp.usages.push({
                    name: match,
                    originalRange,
                    macroParameter: mp,
                });
            }
        }
    }

    private createMacroDeclaration(
        position: number,
        originalRange: Range,
        nameOriginalRange: Range,
        contentPosition: number,
        match: string,
        name: string,
        parameters: MacroParameter[],
        content: string
    ): MacroDeclaration {
        const type = match.startsWith('macro') ? MacroType.MACRO : MacroType.MACRO_IF_NOT_DEFINED;
        const contentOriginalRange = this.isRoot
            ? this.snapshot.getOriginalRange(contentPosition, contentPosition + content.length)
            : defaultRange;
        const contentSnapshot = this.createContentSnapshot(content, contentPosition);
        const macro = this.snapshot.getMacro(name);
        const md: MacroDeclaration = {
            uri: this.snapshot.uri,
            position,
            originalRange,
            nameOriginalRange,
            contentOriginalRange,
            codeCompletionPosition: originalRange.end,
            name,
            parameters,
            contentSnapshot,
            type,
            macro,
        };
        if (!isDeclarationAlreadyAdded(macro, md)) {
            macro.declarations.push(md);
        }
        this.snapshot.macroDeclarations.push(md);
        return md;
    }

    private createContentSnapshot(content: string, contentPosition: number): Snapshot {
        const originalMacroContent = this.isRoot ? this.getOriginalMacroContent(content, contentPosition) : content;
        const contentSnapshot = new Snapshot(invalidVersion, '', originalMacroContent);
        if (this.isRoot) {
            contentSnapshot.stringRanges = this.getStringRanges(content, contentPosition);
            contentSnapshot.preprocessingOffsets = this.getPreprocessingOffsets(content, contentPosition);
        }
        contentSnapshot.text = content;
        return contentSnapshot;
    }

    private getOriginalMacroContent(content: string, contentPosition: number): string {
        const originalPosition = this.snapshot.getOriginalOffset(contentPosition, true);
        const originalEndPosition = this.snapshot.getOriginalOffset(contentPosition + content.length, false);
        return this.snapshot.originalText.substring(originalPosition, originalEndPosition);
    }

    private getStringRanges(content: string, contentPosition: number): ElementRange[] {
        return this.snapshot.stringRanges
            .filter((sr) => sr.startPosition >= contentPosition && sr.endPosition <= contentPosition + content.length)
            .map((sr) => ({
                startPosition: sr.startPosition - contentPosition,
                endPosition: sr.endPosition - contentPosition,
            }));
    }

    private getPreprocessingOffsets(content: string, contentPosition: number): PreprocessingOffset[] {
        return this.snapshot.preprocessingOffsets
            .filter(
                (po) =>
                    po.afterEndPosition >= contentPosition && po.afterEndPosition <= contentPosition + content.length
            )
            .map((po) => ({
                beforeEndPosition: po.beforeEndPosition - contentPosition,
                afterEndPosition: po.afterEndPosition - contentPosition,
                position: po.position - contentPosition,
                offset: po.offset,
            }));
    }

    private addIncludesInMacro(text: string, offset: number): void {
        const regex = /#[ \t]*include[ \t]*(?:"(?<quotedPath>([^"]|\\")*)"|<(?<angularPath>[^>]*)>)/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(text))) {
            if (regexResult.groups) {
                const position = offset + regexResult.index;
                if (Preprocessor.isInString(position, this.snapshot)) {
                    continue;
                }
                const match = regexResult[0];
                const beforeEndPosition = position + match.length;
                const path = regexResult.groups.quotedPath ?? regexResult.groups.angularPath;
                const type = regexResult.groups.quotedPath ? IncludeType.HLSL_QUOTED : IncludeType.HLSL_ANGULAR;
                Preprocessor.createIncludeStatement(beforeEndPosition, type, path, false, null, this.snapshot);
            }
        }
    }

    private processMacroContents(): void {
        const mds = this.snapshot.macroDeclarations.filter((md) => md.uri === this.snapshot.uri);
        const macroNames = this.snapshot.macroDeclarations.map((md) => md.name).join('|');
        const regex = new RegExp(`\\b(${macroNames})\\b`, 'g');
        for (const md of mds) {
            this.addMacrosInMacro(md, regex);
        }
    }

    private addMacrosInMacro(containerMd: MacroDeclaration, regex: RegExp): void {
        const snapshot = containerMd.contentSnapshot;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const identifierEndPosition = position + match.length;
            if (Preprocessor.isInString(position, snapshot)) {
                continue;
            }
            const macro = this.snapshot.getMacro(match);
            if (!hasMacroDeclarationBefore(macro, containerMd.position)) {
                continue;
            }
            const ma = Preprocessor.getMacroArguments(identifierEndPosition, snapshot);
            if (!ma) {
                continue;
            }
            const nameOriginalRange = snapshot.getOriginalRange(position, identifierEndPosition);
            this.offsetPositions(nameOriginalRange, containerMd, ma);
            const mu: MacroUsage = {
                arguments: ma.arguments,
                nameOriginalRange,
                parameterListOriginalRange: ma.argumentListOriginalRange,
                isVisible: true,
                macro,
                macroDeclaration: getMacroDeclaration(macro, ma.arguments.length, position),
            };
            this.snapshot.macroUsages.push(mu);
            macro.usages.push(mu);
        }
    }

    private offsetPositions(nameOriginalRange: Range, md: MacroDeclaration, ma: MacroArguments): void {
        const contentStartPosition = md.contentOriginalRange.start;
        this.offsetPosition(nameOriginalRange.start, contentStartPosition);
        this.offsetPosition(nameOriginalRange.end, contentStartPosition);
        this.offsetPosition(ma.argumentListOriginalRange.start, contentStartPosition);
        this.offsetPosition(ma.argumentListOriginalRange.end, contentStartPosition);
        for (const maa of ma.arguments) {
            this.offsetPosition(maa.originalRange.start, contentStartPosition);
            this.offsetPosition(maa.originalRange.end, contentStartPosition);
            this.offsetPosition(maa.trimmedOriginalStartPosition, contentStartPosition);
        }
    }

    private offsetPosition(position: Position, offset: Position): void {
        if (position.line === 0) {
            position.line = offset.line;
            position.character += offset.character;
        } else {
            position.line += offset.line;
        }
    }

    private expandMacros(): void {
        if (!this.snapshot.macroDeclarations.length) {
            return;
        }
        const macroNames = this.snapshot.macroDeclarations.map((md) => md.name).join('|');
        const regex = new RegExp(`\\b(${macroNames})\\b`, 'g');
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const identifierEndPosition = position + match.length;
            if (Preprocessor.isInString(position, this.snapshot)) {
                continue;
            }
            const macro = this.snapshot.getMacro(match);
            if (!hasMacroDeclarationBefore(macro, position)) {
                continue;
            }
            const ma = Preprocessor.getMacroArguments(identifierEndPosition, this.snapshot);
            const mc = this.snapshot.getMacroContextDeepAt(position);
            if (!ma) {
                continue;
            }
            const md = getMacroDeclaration(macro, ma.arguments.length, position);
            const isVisible = this.isRoot && !this.snapshot.isInIncludeContext(position) && !mc;
            const nameOriginalRange = isVisible
                ? this.snapshot.getOriginalRange(position, identifierEndPosition)
                : defaultRange;
            const mu: MacroUsage = {
                arguments: ma.arguments,
                nameOriginalRange,
                parameterListOriginalRange: ma.argumentListOriginalRange,
                isVisible,
                macro,
                macroDeclaration: md,
            };
            this.snapshot.macroUsages.push(mu);
            macro.usages.push(mu);
            if (!md) {
                continue;
            }
            if (this.isCircularMacroExpansion(mc, md)) {
                continue;
            }
            const beforeEndPosition = ma.endPosition;
            this.expandMacro(position, beforeEndPosition, md, ma, mc);
            regex.lastIndex = position;
        }
    }

    private expandMacro(
        position: number,
        beforeEndPosition: number,
        md: MacroDeclaration,
        ma: MacroArguments,
        parentMc: MacroContext | null = null
    ): void {
        const pasteText = this.getMacroPasteText(md, ma);
        const afterEndPosition = position + pasteText.length;
        Preprocessor.changeTextAndAddOffset(position, beforeEndPosition, afterEndPosition, pasteText, this.snapshot);
        this.createMacroContext(position, afterEndPosition, md, parentMc);
        Preprocessor.addStringRanges(position, afterEndPosition, this.snapshot);
    }

    private getMacroPasteText(md: MacroDeclaration, ma: MacroArguments): string {
        if (!ma.arguments.length) {
            return md.contentSnapshot.originalText;
        }
        const contentSnapshot = new Snapshot(invalidVersion, '', '');
        contentSnapshot.text = md.contentSnapshot.originalText;
        Preprocessor.addStringRanges(0, contentSnapshot.text.length, contentSnapshot);
        const parameterNames = md.parameters.map((mp) => mp.name);
        const regex = new RegExp(`\\b(${parameterNames.join('|')})\\b`, 'g');
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(contentSnapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const argument = ma.arguments[parameterNames.indexOf(match)].content;
            const beforeEndPosition = position + match.length;
            const afterEndPosition = position + argument.length;
            if (Preprocessor.isInString(position, contentSnapshot)) {
                continue;
            }
            Preprocessor.changeTextAndAddOffset(
                position,
                beforeEndPosition,
                afterEndPosition,
                argument,
                contentSnapshot
            );
            regex.lastIndex = afterEndPosition;
        }
        return contentSnapshot.text;
    }

    private createMacroContext(
        position: number,
        afterEndPosition: number,
        md: MacroDeclaration,
        parentMc: MacroContext | null
    ): MacroContext {
        const mc: MacroContext = {
            startPosition: position,
            endPosition: afterEndPosition,
            parent: parentMc,
            children: [],
            macroDeclaration: md,
        };
        this.snapshot.macroContexts.push(mc);
        return mc;
    }

    private isCircularMacroExpansion(mc: MacroContext | null, md: MacroDeclaration | null): boolean {
        let currentMc: MacroContext | null = mc;
        while (currentMc) {
            if (md && currentMc.macroDeclaration === md) {
                return true;
            }
            currentMc = currentMc.parent;
        }
        return false;
    }

    private findHlslBlocks(text: string, offset = 0): void {
        const regex = /\b(?:hlsl\s*(?:\(\s*(?<stage>\w*)\s*\))?)/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(text))) {
            const position = offset + regexResult.index;
            if (Preprocessor.isInString(position, this.snapshot)) {
                continue;
            }
            const match = regexResult[0];
            const hlslKeywordEndPosition = position + match.length;
            const hbp = new HlslBlockProcesor(this.snapshot);
            const hlslRange = hbp.getHlslBlock(hlslKeywordEndPosition);
            if (hlslRange) {
                const stage = regexResult.groups?.stage ?? '';
                const hlslBlock: HlslBlock = {
                    originalRange: this.isRoot
                        ? this.snapshot.getOriginalRange(hlslRange.startPosition, hlslRange.endPosition)
                        : defaultRange,
                    isVisible: this.isRoot,
                    stage: shaderStageKeywordToEnum(stage),
                    ...hlslRange,
                };
                this.snapshot.hlslBlocks.push(hlslBlock);
            }
        }
    }
}
