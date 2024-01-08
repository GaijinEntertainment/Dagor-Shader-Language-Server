import { DocumentUri, Range } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

import { getFileContent } from '../core/file-cache-manager';
import { Snapshot } from '../core/snapshot';
import { PerformanceHelper } from '../helper/performance-helper';
import { getDocuments } from '../helper/server-helper';
import { IncludeContext } from '../interface/include/include-context';
import { IncludeResult } from '../interface/include/include-result';
import { IncludeStatement } from '../interface/include/include-statement';
import { IncludeType } from '../interface/include/include-type';
import { MacroContext } from '../interface/macro/macro-context';
import { MacroArguments } from '../interface/macro/macro-parameters';
import { MacroStatement } from '../interface/macro/macro-statement';
import { MacroType } from '../interface/macro/macro-type';
import { getIncludedDocumentUri } from './include-resolver';
import { Preprocessor } from './preprocessor';

export async function preprocessDshl(snapshot: Snapshot): Promise<void> {
    return await new DshlPreprocessor(snapshot).preprocess();
}

class DshlPreprocessor {
    private snapshot: Snapshot;
    private ph: PerformanceHelper;
    public static sph = new PerformanceHelper();

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
        this.ph = new PerformanceHelper(this.snapshot.uri);
    }

    public async preprocess(): Promise<void> {
        this.ph.start('preprocess');
        this.ph.start('preprocessIncludes');
        await this.preprocessIncludes([]);
        this.ph.end('preprocessIncludes');
        this.ph.start('preprocessMacros');
        this.preprocessMacros();
        this.ph.end('preprocessMacros');
        this.ph.start('expandMacros');
        this.expandMacros();
        this.ph.end('expandMacros');
        this.ph.end('preprocess');
        this.ph.log('  DSHL preprocessor', 'preprocess');
        this.ph.log('    expanding includes', 'preprocessIncludes');
        this.ph.log('    finding macros', 'preprocessMacros');
        this.ph.log('    expanding macros', 'expandMacros');
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
            const snapshot = await this.getInclude(is, [
                this.snapshot.uri,
                ...parentUris,
            ]);
            results.push({
                snapshot,
                position,
                beforeEndPosition,
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
        const pathOriginalRange = Preprocessor.getIncludePathOriginalRange(
            beforeEndPosition,
            path,
            snapshot
        );
        const is: IncludeStatement = {
            path,
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

    private async getInclude(
        is: IncludeStatement,
        parentUris: DocumentUri[]
    ): Promise<Snapshot> {
        const uri = await getIncludedDocumentUri(is);
        if (!uri || parentUris.includes(uri)) {
            return new Snapshot(-1, '', '');
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
            return new Snapshot(-1, uri, document.getText());
        } else {
            const text = await getFileContent(URI.parse(uri).fsPath);
            return new Snapshot(-1, uri, text);
        }
    }

    private pasteIncludes(includeResults: IncludeResult[]): void {
        let offset = 0;
        for (const result of includeResults) {
            result.position += offset;
            result.beforeEndPosition += offset;
            const afterEndPosition =
                result.position + result.snapshot.text.length;
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
                snapshot: result.snapshot,
                parent: null,
            };
            this.snapshot.includeContexts.push(ic);
            // TODO: get string ranges from the included snapshot
            Preprocessor.addStringRanges(
                ic.startPosition,
                ic.endPosition,
                this.snapshot
            );
            for (const icc of result.snapshot.includeContexts) {
                ic.children.push(icc);
                icc.parent = ic;
            }
            this.offsetChildren(ic, ic.startPosition);
            offset +=
                result.snapshot.text.length -
                (result.beforeEndPosition - result.position);
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
            this.addIncludesInMacro(
                content,
                position + (regexResult.groups?.beforeContent?.length ?? 0)
            );
            const beforeNameOffset =
                regexResult.groups?.beforeName?.length ?? 0;
            const nameOriginalRange = this.snapshot.getOriginalRange(
                beforeNameOffset + position,
                beforeNameOffset + position + name.length
            );
            const originalRange = this.snapshot.getOriginalRange(
                position,
                beforeEndPosition
            );
            Preprocessor.removeTextAndAddOffset(
                position,
                beforeEndPosition,
                this.snapshot
            );
            regex.lastIndex = position;
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
        const type = match.startsWith('macro')
            ? MacroType.MACRO
            : MacroType.MACRO_IF_NOT_DEFINED;
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
            name,
            parameters: parametersArray,
            content,
            type,
        };
        this.snapshot.macroStatements.push(ms);
        return ms;
    }

    private addIncludesInMacro(text: string, offset: number): void {
        const regex =
            /#[ \t]*include[ \t]*(?:"(?<quotedPath>([^"]|\\")+)"|<(?<angularPath>[^>]+)>)/g;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(text))) {
            if (regexResult.groups) {
                const position = offset + regexResult.index;
                if (Preprocessor.isInString(position, this.snapshot)) {
                    continue;
                }
                const match = regexResult[0];
                const beforeEndPosition = position + match.length;
                const path =
                    regexResult.groups.quotedPath ??
                    regexResult.groups.angularPath;
                const type = regexResult.groups.quotedPath
                    ? IncludeType.HLSL_QUOTED
                    : IncludeType.HLSL_ANGULAR;
                this.addIncludeInMacro(position, beforeEndPosition, type, path);
            }
        }
    }

    private addIncludeInMacro(
        position: number,
        beforeEndPosition: number,
        type: IncludeType,
        path: string
    ): void {
        const parentIc = this.snapshot.getIncludeContextDeepAt(position);
        const parentMc = this.snapshot.getMacroContextAt(position);
        Preprocessor.createIncludeStatement(
            beforeEndPosition,
            type,
            path,
            parentMc,
            parentIc,
            this.snapshot
        );
    }

    private expandMacros(): void {
        if (!this.snapshot.macroStatements.length) {
            return;
        }
        const macroNames = this.snapshot.macroStatements
            .map((ms) => ms.name)
            .join('|');
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
            const ma = Preprocessor.getMacroArguments(
                identifierEndPosition,
                this.snapshot
            );
            if (!ma || ms.parameters.length !== ma.arguments.length) {
                continue;
            }
            const parentMc = this.snapshot.getMacroContextDeepAt(position);
            if (this.isCircularMacroExpansion(parentMc, ms)) {
                continue;
            }
            const beforeEndPosition = ma.endPosition;
            this.expandMacro(
                position,
                identifierEndPosition,
                beforeEndPosition,
                ms,
                ma,
                parentMc
            );
            regex.lastIndex = position;
        }
    }

    private expandMacro(
        position: number,
        identifierEndPosition: number,
        beforeEndPosition: number,
        ms: MacroStatement,
        ma: MacroArguments,
        parentMc: MacroContext | null = null
    ): void {
        const pasteText = this.getMacroPasteText(ms, ma);
        const afterEndPosition = position + pasteText.length;
        const originalRange = this.snapshot.getOriginalRange(
            position,
            beforeEndPosition
        );
        const originalNameRange = this.snapshot.getOriginalRange(
            position,
            identifierEndPosition
        );
        Preprocessor.changeTextAndAddOffset(
            position,
            beforeEndPosition,
            afterEndPosition,
            pasteText,
            this.snapshot
        );
        this.createMacroContext(
            position,
            afterEndPosition,
            originalRange,
            originalNameRange,
            ms,
            parentMc
        );
        Preprocessor.addStringRanges(position, afterEndPosition, this.snapshot);
    }

    private getMacroPasteText(ms: MacroStatement, ma: MacroArguments): string {
        if (!ma.arguments.length) {
            return ms.content;
        }
        const contentSnapshot = new Snapshot(-1, '', '');
        contentSnapshot.text = ms.content;
        Preprocessor.addStringRanges(
            0,
            contentSnapshot.text.length,
            contentSnapshot
        );
        const parameterNames = ms.parameters.join('|');
        const regex = new RegExp(`\\b(${parameterNames})\\b`, 'g');
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(contentSnapshot.text))) {
            const position = regexResult.index;
            const match = regexResult[0];
            const argument = ma.arguments[ms.parameters.indexOf(match)];
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
        parentMc: MacroContext | null
    ): MacroContext {
        const isNotVisible =
            !!parentMc || !!this.snapshot.getIncludeContextAt(position);
        const mc: MacroContext = {
            macro: ms,
            startPosition: position,
            endPosition: afterEndPosition,
            originalRange,
            originalNameRange,
            parent: parentMc,
            children: [],
            isNotVisible,
        };
        this.snapshot.macroContexts.push(mc);
        return mc;
    }

    private isCircularMacroExpansion(
        mc: MacroContext | null,
        ms: MacroStatement | null
    ): boolean {
        let currentMc: MacroContext | null = mc;
        while (currentMc) {
            if (currentMc.macro === ms) {
                return true;
            }
            currentMc = currentMc.parent;
        }
        return false;
    }
}
