import { DocumentUri, Position, Range } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { getFileContent, getFileVersion } from '../core/file-cache-manager';
import { Snapshot } from '../core/snapshot';
import { defaultRange } from '../helper/helper';
import { getDocuments } from '../helper/server-helper';
import { ElementRange } from '../interface/element-range';
import { HlslBlock } from '../interface/hlsl-block';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeResult } from '../interface/include/include-result';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { MacroArguments } from '../interface/macro/macro-arguments';
import { MacroContext } from '../interface/macro/macro-context';
import { MacroContextBase } from '../interface/macro/macro-context-base';
import { MacroParameter } from '../interface/macro/macro-parameter';
import { MacroStatement } from '../interface/macro/macro-statement';
import { MacroType } from '../interface/macro/macro-type';
import { PreprocessingOffset } from '../interface/preprocessing-offset';
import { shaderStageKeywordToEnum } from '../interface/shader-stage';
import { invalidVersion } from '../interface/snapshot-version';
import { TextEdit } from '../interface/text-edit';
import { HlslBlockProcesor } from './hlsl-block-processor';
import { getIncludedDocumentUri } from './include-resolver';
import { Preprocessor } from './preprocessor';

export async function preprocessDshl(snapshot: Snapshot): Promise<void> {
    return await new DshlPreprocessor(snapshot).preprocess();
}

class DshlPreprocessor {
    private snapshot: Snapshot;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
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
        let pathOriginalRange: Range;
        if (isIncluded) {
            pathOriginalRange = defaultRange;
        } else {
            pathOriginalRange = Preprocessor.getIncludePathOriginalRange(beforeEndPosition, path, snapshot);
        }
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
        const snapshot = await this.getSnapshot(uri);
        new Preprocessor(snapshot).clean();
        const dp = new DshlPreprocessor(snapshot);
        dp.preprocessMacros();
        await dp.preprocessIncludes(parentUris);
        dp.expandMacros();
        return snapshot;
    }

    private async getSnapshot(uri: DocumentUri): Promise<Snapshot> {
        // TODO: make it more uniform with the file cache, and support HLSL
        const document = getDocuments().get(uri);
        if (document) {
            this.snapshot.version.includedDocumentsVersion.set(uri, {
                version: document.version,
                isManaged: true,
            });
            return new Snapshot(invalidVersion, uri, document.getText());
        } else {
            const text = await getFileContent(URI.parse(uri).fsPath);
            const cachedVersion = getFileVersion(URI.parse(uri).fsPath);
            this.snapshot.version.includedDocumentsVersion.set(uri, {
                version: cachedVersion,
                isManaged: false,
            });
            return new Snapshot(invalidVersion, uri, text);
        }
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
            this.snapshot.includeContexts.push(ic);
            for (const sr of result.snapshot.stringRanges) {
                sr.startPosition += offset;
                sr.endPosition += offset;
                this.snapshot.stringRanges.push(sr);
            }
            for (const icc of result.snapshot.includeContexts) {
                ic.children.push(icc);
                icc.parent = ic;
            }
            for (const [uri, version] of result.snapshot.version.includedDocumentsVersion.entries()) {
                this.snapshot.version.includedDocumentsVersion.set(uri, version);
            }
            for (const ms of result.snapshot.macroStatements) {
                ms.codeCompletionPosition = ic.includeStatement.originalEndPosition;
                ms.position += offset;
                this.snapshot.macroStatements.push(ms);
            }
            for (const mc of result.snapshot.macroContexts) {
                mc.startPosition += offset;
                mc.endPosition += offset;
                mc.isVisible = false;
                this.offsetChildren(mc, ic.startPosition);
                this.snapshot.macroContexts.push(mc);
            }
            this.offsetChildren(ic, ic.startPosition);
            offset += result.snapshot.text.length - (result.beforeEndPosition - result.position);
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
            const ic = this.snapshot.getIncludeContextAt(position);
            const mc = this.snapshot.getMacroContextAt(position);
            if (!ic && !mc) {
                this.addIncludesInMacro(content, contentOffset);
                this.findHlslBlocks(content, contentOffset);
            }
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
            if (this.snapshot.macroStatements.some((ms) => ms.name === name)) {
                continue;
            }
            const parameters = regexResult.groups?.parameters ?? '';
            const parametersOffset = position + (regexResult.groups?.beforeParameters?.length ?? 0);
            const macroParameters = this.getParameters(parameters, parametersOffset);
            this.addParameterUsages(macroParameters, content, contentOffset);
            this.createMacroStatement(
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

    private createMacroStatement(
        position: number,
        originalRange: Range,
        nameOriginalRange: Range,
        contentPosition: number,
        match: string,
        name: string,
        parameters: MacroParameter[],
        content: string
    ): MacroStatement {
        const ic = this.snapshot.getIncludeContextDeepAt(position);
        const rootIc = this.snapshot.getIncludeContextAt(position);
        const type = match.startsWith('macro') ? MacroType.MACRO : MacroType.MACRO_IF_NOT_DEFINED;
        const contentOriginalRange = this.snapshot.getOriginalRange(contentPosition, contentPosition + content.length);
        const contentSnapshot = this.createContentSnapshot(content, contentPosition, ic);
        const ms: MacroStatement = {
            uri: ic?.snapshot?.uri ?? this.snapshot.uri,
            position,
            originalRange,
            nameOriginalRange,
            contentOriginalRange,
            codeCompletionPosition: rootIc ? rootIc.includeStatement.originalEndPosition : originalRange.end,
            name,
            parameters,
            contentSnapshot,
            type,
            usages: [],
        };
        this.snapshot.macroStatements.push(ms);
        return ms;
    }

    private createContentSnapshot(content: string, contentPosition: number, ic: IncludeContext | null): Snapshot {
        const originalMacroContent = this.getOriginalMacroContent(content, contentPosition, ic);
        const contentSnapshot = new Snapshot(invalidVersion, '', originalMacroContent);
        contentSnapshot.stringRanges = this.getStringRanges(content, contentPosition, ic);
        contentSnapshot.preprocessingOffsets = this.getPreprocessingOffsets(content, contentPosition, ic);
        contentSnapshot.text = content;
        return contentSnapshot;
    }

    private getOriginalMacroContent(content: string, contentPosition: number, ic: IncludeContext | null): string {
        if (ic) {
            return content;
        }
        const originalPosition = this.snapshot.getOriginalOffset(contentPosition, true);
        const originalEndPosition = this.snapshot.getOriginalOffset(contentPosition + content.length, true);
        return this.snapshot.originalText.substring(originalPosition, originalEndPosition);
    }

    private getStringRanges(content: string, contentPosition: number, ic: IncludeContext | null): ElementRange[] {
        if (ic) {
            return [];
        }
        return this.snapshot.stringRanges
            .filter((sr) => sr.startPosition >= contentPosition && sr.endPosition <= contentPosition + content.length)
            .map((sr) => ({
                startPosition: sr.startPosition - contentPosition,
                endPosition: sr.endPosition - contentPosition,
            }));
    }

    private getPreprocessingOffsets(
        content: string,
        contentPosition: number,
        ic: IncludeContext | null
    ): PreprocessingOffset[] {
        if (ic) {
            return [];
        }
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
        const regex = /#[ \t]*include[ \t]*(?:"(?<quotedPath>([^"]|\\")+)"|<(?<angularPath>[^>]+)>)/g;
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
                this.addIncludeInMacro(position, beforeEndPosition, type, path);
            }
        }
    }

    private addIncludeInMacro(position: number, beforeEndPosition: number, type: IncludeType, path: string): void {
        const parentIc = this.snapshot.getIncludeContextDeepAt(position);
        const parentMc = this.snapshot.getMacroContextAt(position);
        Preprocessor.createIncludeStatement(beforeEndPosition, type, path, parentMc, parentIc, this.snapshot);
    }

    private processMacroContents(): void {
        const mss = this.snapshot.macroStatements.filter((ms) => ms.uri === this.snapshot.uri);
        const macroNames = this.snapshot.macroStatements.map((ms) => ms.name).join('|');
        const regex = new RegExp(`\\b(${macroNames})\\b`, 'g');
        for (const ms of mss) {
            this.addMacrosInMacro(ms, regex);
        }
    }

    private addMacrosInMacro(containerMs: MacroStatement, regex: RegExp): void {
        const snapshot = containerMs.contentSnapshot;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const identifierEndPosition = position + match.length;
            if (Preprocessor.isInString(position, snapshot)) {
                continue;
            }
            const ms = this.snapshot.getMacroStatement(match, containerMs.position);
            if (!ms) {
                continue;
            }
            const ma = Preprocessor.getMacroArguments(identifierEndPosition, snapshot);
            if (!ma) {
                continue;
            }
            const nameOriginalRange = snapshot.getOriginalRange(position, identifierEndPosition);
            this.offsetPositions(nameOriginalRange, containerMs, ma);
            const pmc: MacroContextBase = {
                arguments: ma.arguments,
                macroStatement: ms,
                nameOriginalRange,
                parameterListOriginalRange: ma.argumentListOriginalRange,
                isVisible: true,
            };
            this.snapshot.potentialMacroContexts.push(pmc);
            ms.usages.push(pmc);
        }
    }

    private offsetPositions(nameOriginalRange: Range, containerMs: MacroStatement, ma: MacroArguments): void {
        const contentStartPosition = containerMs.contentOriginalRange.start;
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
        if (!this.snapshot.macroStatements.length) {
            return;
        }
        const macroNames = this.snapshot.macroStatements.map((ms) => ms.name).join('|');
        const regex = new RegExp(`\\b(${macroNames})\\b`, 'g');
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const identifierEndPosition = position + match.length;
            if (Preprocessor.isInString(position, this.snapshot)) {
                continue;
            }
            const ms = this.snapshot.getMacroStatement(match, position);
            if (!ms) {
                continue;
            }
            const ma = Preprocessor.getMacroArguments(identifierEndPosition, this.snapshot);
            const mc = this.snapshot.getMacroContextAt(position);
            const ic = this.snapshot.getIncludeContextAt(position);
            if (!ma) {
                continue;
            }
            const nameOriginalRange = this.snapshot.getOriginalRange(position, identifierEndPosition);
            const pmc: MacroContextBase = {
                arguments: ma.arguments,
                macroStatement: ms,
                nameOriginalRange,
                parameterListOriginalRange: ma.argumentListOriginalRange,
                isVisible: !ic && !mc,
            };
            this.snapshot.potentialMacroContexts.push(pmc);
            ms.usages.push(pmc);
            if (ms.parameters.length !== ma.arguments.length) {
                continue;
            }
            if (this.isCircularMacroExpansion(mc, ms)) {
                continue;
            }
            const beforeEndPosition = ma.endPosition;
            this.expandMacro(position, beforeEndPosition, nameOriginalRange, ms, ma, ic, mc);
            regex.lastIndex = position;
        }
    }

    private expandMacro(
        position: number,
        beforeEndPosition: number,
        originalNameRange: Range,
        ms: MacroStatement,
        ma: MacroArguments,
        ic: IncludeContext | null,
        parentMc: MacroContext | null = null
    ): void {
        const pasteText = this.getMacroPasteText(ms, ma);
        const afterEndPosition = position + pasteText.length;
        const originalRange = this.snapshot.getOriginalRange(position, beforeEndPosition);
        Preprocessor.changeTextAndAddOffset(position, beforeEndPosition, afterEndPosition, pasteText, this.snapshot);
        this.createMacroContext(position, afterEndPosition, originalRange, originalNameRange, ms, ma, ic, parentMc);
        Preprocessor.addStringRanges(position, afterEndPosition, this.snapshot);
    }

    private getMacroPasteText(ms: MacroStatement, ma: MacroArguments): string {
        if (!ma.arguments.length) {
            return ms.contentSnapshot.originalText;
        }
        const contentSnapshot = new Snapshot(invalidVersion, '', '');
        contentSnapshot.text = ms.contentSnapshot.originalText;
        Preprocessor.addStringRanges(0, contentSnapshot.text.length, contentSnapshot);
        const parameterNames = ms.parameters.map((mp) => mp.name);
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
        originalRange: Range,
        originalNameRange: Range,
        ms: MacroStatement,
        ma: MacroArguments,
        ic: IncludeContext | null,
        parentMc: MacroContext | null
    ): MacroContext {
        const isVisible = !parentMc && !ic;
        const mc: MacroContext = {
            macroStatement: ms,
            startPosition: position,
            endPosition: afterEndPosition,
            originalRange,
            nameOriginalRange: originalNameRange,
            parent: parentMc,
            children: [],
            isVisible,
            arguments: ma.arguments,
            parameterListOriginalRange: ma.argumentListOriginalRange,
        };
        this.snapshot.macroContexts.push(mc);
        return mc;
    }

    private isCircularMacroExpansion(mc: MacroContext | null, ms: MacroStatement | null): boolean {
        let currentMc: MacroContext | null = mc;
        while (currentMc) {
            if (currentMc.macroStatement === ms) {
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
            const ic = this.snapshot.getIncludeContextAt(position);
            const mc = this.snapshot.getMacroContextAt(position);
            const hbp = new HlslBlockProcesor(this.snapshot);
            const hlslRange = hbp.getHlslBlock(hlslKeywordEndPosition);
            if (hlslRange) {
                const stage = regexResult.groups?.stage ?? '';
                const hlslBlock: HlslBlock = {
                    originalRange: this.snapshot.getOriginalRange(hlslRange.startPosition, hlslRange.endPosition),
                    isVisible: !ic && !mc,
                    stage: shaderStageKeywordToEnum(stage),
                    ...hlslRange,
                };
                this.snapshot.hlslBlocks.push(hlslBlock);
            }
        }
    }
}
