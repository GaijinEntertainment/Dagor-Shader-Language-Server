import { Snapshot } from '../core/snapshot';
import { PerformanceHelper } from '../helper/performance-helper';
import { IncludeType } from '../interface/include-type';
import { MacroContext } from '../interface/macro-context';
import { MacroArguments } from '../interface/macro-parameters';
import { MacroStatement } from '../interface/macro-statement';
import { Preprocessor } from './preprocessor';

export async function preprocessDshl(snapshot: Snapshot): Promise<void> {
    return await new DshlPreprocessor(snapshot).preprocess();
}

class DshlPreprocessor {
    private snapshot: Snapshot;
    private ph: PerformanceHelper;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
        this.ph = new PerformanceHelper(this.snapshot.uri);
    }

    public async preprocess(): Promise<void> {
        this.ph.start('preprocess');
        Preprocessor.updateStringRanges(
            0,
            this.snapshot.text.length,
            this.snapshot
        );
        this.ph.start('preprocessIncludes');
        await this.preprocessIncludes();
        this.ph.end('preprocessIncludes');
        this.ph.start('preprocessMacros');
        this.preprocessMacros();
        this.ph.end('preprocessMacros');
        this.ph.start('expandMacros');
        // this.expandMacros();
        this.ph.end('expandMacros');
        this.ph.end('preprocess');
        this.ph.log('  DSHL preprocessor', 'preprocess');
        this.ph.log('    expanding includes', 'preprocessIncludes');
        this.ph.log('    finding macros', 'preprocessMacros');
        this.ph.log('    expanding macros', 'expandMacros');
    }

    private async preprocessIncludes(): Promise<void> {
        const regex = /(?<=^[ \t]*)include(?:_optional)?\s*"(?<path>[^"]*)"/gm;
        let regexResult: RegExpExecArray | null;
        while ((regexResult = regex.exec(this.snapshot.text))) {
            const position = regexResult.index;
            if (Preprocessor.isInString(position, this.snapshot)) {
                continue;
            }
            const match = regexResult[0];
            const beforeEndPosition = position + match.length;
            const path = regexResult.groups?.path ?? '';
            const parentIc = this.snapshot.getIncludeContextDeepAt(position);
            const is = Preprocessor.createIncludeStatement(
                beforeEndPosition,
                IncludeType.DSHL,
                path,
                null,
                parentIc,
                this.snapshot
            );
            // await Preprocessor.includeContent(
            //     position,
            //     beforeEndPosition,
            //     is,
            //     parentIc,
            //     this.snapshot
            // );
            // regex.lastIndex = position;
        }
    }

    private preprocessMacros(): void {
        const regex =
            /(?<beforeContent>\b(?:macro|define_macro_if_not_defined)\s+(?<name>[a-zA-Z_]\w*)\s*\(\s*(?<parameters>[a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*\s*(,\s*)?)?\))(?<content>\s*(\r?\n)?(^[^\r\n]*(?:\r?\n))*?(\r?\n)?\s*)endmacro/gm;
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
            Preprocessor.removeTextAndAddOffset(
                position,
                beforeEndPosition,
                this.snapshot
            );
            regex.lastIndex = position;

            if (this.snapshot.macroStatements.some((ms) => ms.name === name)) {
                continue;
            }
            const ms: MacroStatement = {
                position,
                name,
                parameters:
                    regexResult.groups?.parameters
                        ?.replace(/\s/g, '')
                        .split(',')
                        .filter((p) => p.length) ?? [],
                content,
            };
            this.snapshot.macroStatements.push(ms);
        }
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
            this.expandMacro(position, beforeEndPosition, ms, ma, parentMc);
            regex.lastIndex = position;
        }
    }

    private expandMacro(
        position: number,
        beforeEndPosition: number,
        ms: MacroStatement,
        ma: MacroArguments,
        parentMc: MacroContext | null = null
    ): void {
        const pasteText = this.getMacroPasteText(ms, ma);
        const afterEndPosition = position + pasteText.length;
        Preprocessor.changeTextAndAddOffset(
            position,
            beforeEndPosition,
            afterEndPosition,
            pasteText,
            this.snapshot
        );
        const mc: MacroContext = {
            macro: ms,
            startPosition: position,
            endPosition: afterEndPosition,
            parent: parentMc,
            children: [],
        };
        this.snapshot.macroContexts.push(mc);
        Preprocessor.updateStringRanges(
            position,
            afterEndPosition,
            this.snapshot
        );
    }

    private getMacroPasteText(ms: MacroStatement, ma: MacroArguments): string {
        if (!ma.arguments.length) {
            return ms.content;
        }
        const contentSnapshot = new Snapshot(-1, '', '');
        contentSnapshot.text = ms.content;
        Preprocessor.updateStringRanges(
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
