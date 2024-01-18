import { DocumentUri, Range } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { getFileContent, getFileVersion } from '../core/file-cache-manager';
import { Snapshot } from '../core/snapshot';
import { getDocuments } from '../helper/server-helper';
import { HlslBlock } from '../interface/hlsl-block';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeResult } from '../interface/include/include-result';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { MacroArguments } from '../interface/macro/macro-arguments';
import { MacroContext } from '../interface/macro/macro-context';
import { MacroContextBase } from '../interface/macro/macro-context-base';
import { MacroStatement } from '../interface/macro/macro-statement';
import { MacroType } from '../interface/macro/macro-type';
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
        await this.preprocessIncludes([]);
        this.preprocessMacros();
        this.expandMacros();
        this.findHlslBlocks(this.snapshot.text);
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
                parentUris,
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
        parentUris: DocumentUri[],
        snapshot: Snapshot
    ): IncludeStatement {
        const pathOriginalRange = Preprocessor.getIncludePathOriginalRange(beforeEndPosition, path, snapshot);
        const originalEndPosition = snapshot.getOriginalPosition(beforeEndPosition, false);
        const is: IncludeStatement = {
            path,
            originalEndPosition,
            pathOriginalRange,
            type,
            includerUri: snapshot.uri,
        };
        // TODO: make it work with HLSL: don't add if it's in a define context
        if (!parentUris.length) {
            snapshot.includeStatements.push(is);
        }
        return is;
    }

    private async getInclude(is: IncludeStatement, parentUris: DocumentUri[]): Promise<Snapshot> {
        const uri = await getIncludedDocumentUri(is);
        if (!uri || parentUris.includes(uri)) {
            return new Snapshot(invalidVersion, '', '');
        }
        const snapshot = await this.getSnapshot(uri);
        new Preprocessor(snapshot).clean();
        await new DshlPreprocessor(snapshot).preprocessIncludes(parentUris);
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
            // TODO: get string ranges from the included snapshot
            Preprocessor.addStringRanges(ic.startPosition, ic.endPosition, this.snapshot);
            for (const icc of result.snapshot.includeContexts) {
                ic.children.push(icc);
                icc.parent = ic;
            }
            for (const [uri, version] of result.snapshot.version.includedDocumentsVersion.entries()) {
                this.snapshot.version.includedDocumentsVersion.set(uri, version);
            }
            this.offsetChildren(ic, ic.startPosition);
            offset += result.snapshot.text.length - (result.beforeEndPosition - result.position);
        }
    }

    private offsetChildren(ic: IncludeContext, offset: number): void {
        for (const icc of ic.children) {
            icc.startPosition += offset;
            icc.endPosition += offset;
            this.offsetChildren(icc, offset);
        }
    }

    private preprocessMacros(): void {
        const textEdits: TextEdit[] = [];
        const regex =
            /(?<beforeContent>\b(?<beforeName>(?:macro|define_macro_if_not_defined)\s+)(?<name>[a-zA-Z_]\w*)\s*\(\s*(?<parameters>[a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*\s*(,\s*)?)?\))(?<content>\s*(\r?\n)?(^[^\r\n]*(?:\r?\n))*?(\r?\n)?\s*)endmacro/gm;
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
                this.addMacrosInMacro(content, contentOffset);
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
            this.createMacroStatement(
                position,
                originalRange,
                nameOriginalRange,
                match,
                name,
                regexResult.groups?.parameters ?? '',
                content
            );
        }
        Preprocessor.executeTextEdits(textEdits, this.snapshot);
    }

    private createMacroStatement(
        position: number,
        originalRange: Range,
        nameOriginalRange: Range,
        match: string,
        name: string,
        parameters: string,
        content: string
    ): MacroStatement {
        const ic = this.snapshot.getIncludeContextDeepAt(position);
        const rootIc = this.snapshot.getIncludeContextAt(position);
        const type = match.startsWith('macro') ? MacroType.MACRO : MacroType.MACRO_IF_NOT_DEFINED;
        const parametersArray =
            parameters
                ?.replace(/\s/g, '')
                .split(',')
                .filter((p) => p.length) ?? [];
        const ms: MacroStatement = {
            uri: ic?.snapshot?.uri ?? this.snapshot.uri,
            position,
            originalRange,
            nameOriginalRange,
            codeCompletionPosition: rootIc ? rootIc.includeStatement.originalEndPosition : originalRange.end,
            name,
            parameters: parametersArray,
            content,
            type,
            usages: [],
        };
        this.snapshot.macroStatements.push(ms);
        return ms;
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

    private handleMacros(
        text: string,
        macroFunction: (
            position: number,
            nameOriginalRange: Range,
            ms: MacroStatement,
            ma: MacroArguments,
            regex: RegExp,
            ic: IncludeContext | null,
            parentMc: MacroContext | null
        ) => string,
        offset = 0
    ): void {
        if (!this.snapshot.macroStatements.length) {
            return;
        }
        const macroNames = this.snapshot.macroStatements.map((ms) => ms.name).join('|');
        const regex = new RegExp(`\\b(${macroNames})\\b`, 'g');
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(text))) {
            const position = offset + regexResult.index;
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
            const parentMc = this.snapshot.getMacroContextDeepAt(position);
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
                isVisible: !ic && !parentMc,
            };
            this.snapshot.potentialMacroContexts.push(pmc);
            ms.usages.push(pmc);
            if (ms.parameters.length !== ma.arguments.length) {
                continue;
            }
            text = macroFunction(position, nameOriginalRange, ms, ma, regex, ic, parentMc);
        }
    }

    private addMacrosInMacro(text: string, offset: number): void {
        this.handleMacros(
            text,
            (position, originalNameRange, ms, ma, regex, ic) => {
                this.addMacroInMacro(position, originalNameRange, ms, ma, ic);
                return text;
            },
            offset
        );
    }

    private addMacroInMacro(
        position: number,
        originalNameRange: Range,
        ms: MacroStatement,
        ma: MacroArguments,
        ic: IncludeContext | null
    ): void {
        const originalRange = this.snapshot.getOriginalRange(position, ma.endPosition);
        this.createMacroContext(position, ma.endPosition, originalRange, originalNameRange, ms, ma, ic, null);
    }

    private expandMacros(): void {
        this.handleMacros(this.snapshot.text, (position, originalNameRange, ms, ma, regex, ic, parentMc) => {
            if (this.isCircularMacroExpansion(parentMc, ms)) {
                return this.snapshot.text;
            }
            const beforeEndPosition = ma.endPosition;
            this.expandMacro(position, beforeEndPosition, originalNameRange, ms, ma, ic, parentMc);
            regex.lastIndex = position;
            return this.snapshot.text;
        });
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
            return ms.content;
        }
        const contentSnapshot = new Snapshot(invalidVersion, '', '');
        contentSnapshot.text = ms.content;
        Preprocessor.addStringRanges(0, contentSnapshot.text.length, contentSnapshot);
        const parameterNames = ms.parameters.join('|');
        const regex = new RegExp(`\\b(${parameterNames})\\b`, 'g');
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(contentSnapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const argument = ma.arguments[ms.parameters.indexOf(match)].content;
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
