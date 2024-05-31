import { TextDocument } from 'vscode-languageserver-textdocument';

import { CommonTokenStream } from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { Position } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { DshlLexer } from '../_generated/DshlLexer';
import { DshlParser } from '../_generated/DshlParser';
import { createLexer, defaultRange, offsetPosition } from '../helper/helper';
import { hlslFunctions } from '../helper/hlsl-function';
import { hlslEnumTypes, hlslStructTypes } from '../helper/hlsl-info';
import { Scope } from '../helper/scope';
import { getDocuments, syncInitialization } from '../helper/server-helper';
import { DocumentVersion } from '../interface/document-version';
import { IntrinsicFunction } from '../interface/function/intrinsic-function';
import {
    ComponentType,
    ConcreteParameter,
    GenericParameter,
    GenericReturnType,
    Overload,
    Parameter,
    Size,
    TemplateType,
} from '../interface/language-element-info';
import { MacroDeclaration } from '../interface/macro/macro-declaration';
import { SnapshotVersion, invalidVersion } from '../interface/snapshot-version';
import { EnumDeclaration } from '../interface/type/enum-declaration';
import { TypeDeclaration } from '../interface/type/type-declaration';
import { DshlVisitor } from '../processor/dshl-visitor';
import { getShaderConfigVersion, syncIncludeFoldersCollection } from '../processor/include-processor';
import { preprocess } from '../processor/preprocessor';
import { HLSLI_EXTENSION, HLSL_EXTENSION } from './constant';
import { getFileVersion } from './file-cache-manager';
import { Snapshot } from './snapshot';

interface IntrinsicType {
    modifiers: string;
    name: string;
    description?: string;
    base: string;
    size?: string;
}

export class DocumentInfo {
    private analyzedVersion = invalidVersion;
    private analyzationInProgressVersion = invalidVersion;
    private analyzationInProgress = Promise.resolve();
    private lastTimeClosed = 0;
    private document: TextDocument;
    private snapshot = new Snapshot(invalidVersion, '', '');

    public constructor(document: TextDocument) {
        this.document = document;
    }

    public async getSnapshot(): Promise<Snapshot> {
        if (this.isAnalyzedVersionValid()) {
            return this.snapshot;
        }
        if (this.isAnalyzationInProgressVersionValid()) {
            await this.analyzationInProgress;
            return this.snapshot;
        }
        this.analyzationInProgress = this.analyze();
        await this.analyzationInProgress;
        return this.snapshot;
    }

    private isAnalyzedVersionValid(): boolean {
        return this.isVersionValid(this.analyzedVersion) && this.analyzedVersion.timestamp > this.lastTimeClosed;
    }

    private isAnalyzationInProgressVersionValid(): boolean {
        return this.isVersionValid(this.analyzationInProgressVersion);
    }

    private isVersionValid(version: SnapshotVersion): boolean {
        if (this.document.version > version.documentVersion) {
            return false;
        }
        if (getShaderConfigVersion() > version.shaderConfigVersion) {
            return false;
        }
        for (const [uri, includedDocumentVersion] of version.includedDocumentsVersion.entries()) {
            const document = getDocuments().get(uri);
            if (document) {
                if (
                    document.version > includedDocumentVersion.version ||
                    (!includedDocumentVersion.isManaged &&
                        (document.version !== 1 ||
                            includedDocumentVersion.version !== getFileVersion(URI.parse(uri).fsPath)))
                ) {
                    return false;
                }
            } else {
                const cachedVersion = getFileVersion(URI.parse(uri).fsPath);
                if (cachedVersion > includedDocumentVersion.version) {
                    return false;
                }
            }
        }
        return true;
    }

    private async analyze(): Promise<void> {
        const includedDocumentsVersion = new Map<string, DocumentVersion>();
        for (const uri of this.analyzedVersion.includedDocumentsVersion.keys()) {
            const document = getDocuments().get(uri);
            if (document) {
                includedDocumentsVersion.set(uri, {
                    version: document.version,
                    isManaged: true,
                });
            } else {
                const cachedVersion = getFileVersion(URI.parse(uri).fsPath);
                includedDocumentsVersion.set(uri, {
                    version: cachedVersion,
                    isManaged: false,
                });
            }
        }
        this.analyzationInProgressVersion = {
            timestamp: Date.now(),
            documentVersion: this.document.version,
            includedDocumentsVersion,
            shaderConfigVersion: getShaderConfigVersion(),
        };
        await syncInitialization();
        await syncIncludeFoldersCollection();
        const snapshot = new Snapshot(this.analyzationInProgressVersion, this.document.uri, this.document.getText());
        await preprocess(snapshot);
        this.analyzeSnapshot(snapshot);
        if (this.analyzedVersion <= snapshot.version) {
            this.analyzedVersion = snapshot.version;
            this.snapshot = snapshot;
        }
    }

    private analyzeSnapshot(snapshot: Snapshot): void {
        this.addBuiltInStructs(snapshot);
        this.addBuiltInEnums(snapshot);
        this.addIntrinsicFunctions(snapshot);
        const lexer = createLexer(snapshot.text);
        const parser = this.createParser(lexer);
        let tree: ParseTree;
        try {
            if (this.document.uri.endsWith(HLSL_EXTENSION) || this.document.uri.endsWith(HLSLI_EXTENSION)) {
                tree = parser.hlsl();
            } else {
                tree = parser.dshl();
            }
            const visitor = new DshlVisitor(snapshot);
            visitor.visit(tree);
        } catch (e) {
            // catching any error during the parsing to prevent the server from crashing
        }
        this.addMacroDefinitions(snapshot);
    }

    private addIntrinsicFunctions(snapshot: Snapshot): void {
        for (const hlslFunction of hlslFunctions) {
            if (hlslFunction?.overloads?.length) {
                for (const overload of hlslFunction.overloads) {
                    this.generateOverload(snapshot, hlslFunction.name, [], overload, 0, hlslFunction.description);
                }
            }
        }
    }

    private generateOverload(
        snapshot: Snapshot,
        name: string,
        concreteParams: IntrinsicType[],
        overload: Overload,
        index: number,
        description?: string,
        previous?: IntrinsicType
    ): void {
        const parameters = overload.parameters;
        if (!parameters.length) {
            this.addOverload(snapshot, overload, name, concreteParams, description);
            return;
        }
        const types = this.getTypes(parameters[index], previous);
        for (const type of types) {
            if (index === 0) {
                previous = type;
            }
            concreteParams.push(type);
            if (index + 1 < parameters.length) {
                this.generateOverload(snapshot, name, concreteParams, overload, index + 1, description, previous);
            } else {
                this.addOverload(snapshot, overload, name, concreteParams, description);
            }
            concreteParams.pop();
        }
    }

    private addOverload(
        snapshot: Snapshot,
        overload: Overload,
        name: string,
        concreteParams: IntrinsicType[],
        description?: string
    ): void {
        const ifd: IntrinsicFunction = {
            name,
            type: this.getReturnType(overload, concreteParams.length ? concreteParams[0] : undefined),
            parameters: concreteParams.map((cp) => ({
                name: cp.name,
                modifiers: cp.modifiers,
                type: cp.base + (cp.size ?? ''),
                description: cp.description,
            })),
            description,
            usages: [],
        };
        snapshot.intrinsicFunctions.push(ifd);
    }

    private getReturnType(overload: Overload, previous?: IntrinsicType): string {
        const returnType = overload.returnType;
        if (this.isGenericReturnType(returnType)) {
            const base = returnType.componentType === 'same' && previous ? previous.base : returnType.componentType;
            let size: string = returnType.size + '' ?? '';
            if (size === 'same') {
                size = previous?.size ?? '';
            }
            if (size === '1') {
                size = '';
            }
            return base + size;
        } else {
            return returnType;
        }
    }

    private getTypes(paramType: Parameter, previous?: IntrinsicType): IntrinsicType[] {
        if (this.isGenericParameter(paramType)) {
            const tt = this.normalizeTemplateType(paramType.templateType, previous);
            const ct = this.normalizeComponentType(paramType.componentType, previous);
            const size = this.normalizeSize(paramType.size, previous);
            return this.generateParameterTypes(paramType, tt, ct, size);
        } else {
            if (paramType.type.length > 3) {
                const width = Number.parseInt(paramType.type[paramType.type.length - 3]);
                const x = paramType.type[paramType.type.length - 2];
                const height = Number.parseInt(paramType.type[paramType.type.length - 1]);
                if (
                    x === 'x' &&
                    !isNaN(width) &&
                    !isNaN(height) &&
                    width >= 1 &&
                    width <= 4 &&
                    height >= 1 &&
                    height <= 4
                ) {
                    return [
                        {
                            base: paramType.type.substring(0, paramType.type.length - 3),
                            name: paramType.name,
                            description: paramType.description,
                            modifiers: paramType.modifiers,
                            size: paramType.type.substring(paramType.type.length - 3),
                        },
                    ];
                }
            }
            if (paramType.type.length > 1) {
                const width = Number.parseInt(paramType.type[paramType.type.length - 1]);
                if (!isNaN(width) && width >= 1 && width <= 4) {
                    [
                        {
                            base: paramType.type.substring(0, paramType.type.length - 3),
                            name: paramType.name,
                            description: paramType.description,
                            modifiers: paramType.modifiers,
                            size: paramType.type.substring(paramType.type.length - 3),
                        },
                    ];
                }
            }
            return [
                {
                    base: paramType.type,
                    name: paramType.name,
                    description: paramType.description,
                    modifiers: paramType.modifiers,
                },
            ];
        }
    }

    private normalizeTemplateType(tt: TemplateType[], previous?: IntrinsicType): TemplateType[] {
        if (tt.length === 1 && tt[0] === 'same') {
            if (previous) {
                if (previous.size?.length === 3) {
                    return ['matrix'];
                } else if (previous.size?.length === 1) {
                    return ['vector'];
                } else {
                    return ['scalar'];
                }
            } else {
                throw new Error();
            }
        } else {
            return tt;
        }
    }

    private normalizeComponentType(ct: ComponentType[], previous?: IntrinsicType): ComponentType[] {
        if (ct.length === 1 && ct[0] === 'same') {
            if (previous) {
                return [previous.base] as ComponentType[];
            } else {
                throw new Error();
            }
        } else {
            return ct;
        }
    }

    private normalizeSize(size: Size, previous?: IntrinsicType): string | undefined {
        if (typeof size === 'number') {
            return size + '';
        } else if (size === 'same') {
            if (previous) {
                return previous.size;
            } else {
                throw new Error();
            }
        }
        return undefined;
    }

    private generateParameterTypes(
        paramType: Parameter,
        templateType: TemplateType[],
        componentType: ComponentType[],
        size?: string
    ): IntrinsicType[] {
        const result: IntrinsicType[] = [];
        for (const tt of templateType) {
            for (const ct of componentType) {
                if (tt === 'scalar' || tt === 'object') {
                    result.push(this.createType(paramType, ct));
                } else if (tt === 'vector') {
                    if (size) {
                        result.push(this.createType(paramType, ct, size));
                    } else {
                        for (let i = 1; i <= 4; i++) {
                            result.push(this.createType(paramType, ct, i + ''));
                        }
                    }
                } else if (tt === 'matrix') {
                    if (size) {
                        result.push(this.createType(paramType, ct, size));
                    } else {
                        for (let i = 1; i <= 4; i++) {
                            for (let j = 1; j <= 4; j++) {
                                if (i !== 1 || j !== 1) {
                                    result.push(this.createType(paramType, ct, i + 'x' + j));
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    private createType(paramType: Parameter, ct: ComponentType, size?: string): IntrinsicType {
        return {
            base: ct,
            size,
            modifiers: paramType.modifiers,
            description: paramType.description,
            name: paramType.name,
        };
    }

    private isGenericParameter(paramType: Parameter): paramType is GenericParameter {
        return !(paramType as ConcreteParameter).type;
    }

    private isGenericReturnType(returnType: GenericReturnType | string): returnType is GenericReturnType {
        return !!(returnType as GenericReturnType).templateType;
    }

    private addBuiltInStructs(snapshot: Snapshot): void {
        for (const hst of hlslStructTypes.filter((hst) => hst.keyword === 'struct')) {
            const td: TypeDeclaration = {
                embeddedEnums: [],
                embeddedTypes: [],
                isBuiltIn: true,
                isVisible: false,
                members: [],
                nameOriginalRange: defaultRange,
                originalRange: defaultRange,
                subTypes: [],
                superTypes: [],
                type: 'struct',
                uri: '',
                usages: [],
                name: hst.name,
                description: hst.description,
                links: hst.links,
            };
            td.members =
                hst.members?.map((hstm) => ({
                    arraySizes: [],
                    isHlsl: true,
                    isVisible: false,
                    name: hstm.name,
                    nameEndPosition: 0,
                    nameOriginalRange: defaultRange,
                    originalRange: defaultRange,
                    type: hstm.type ?? '',
                    uri: '',
                    usages: [],
                    containerType: td,
                    description: hstm.description,
                })) ?? [];
            snapshot.rootScope.typeDeclarations.push(td);
        }
    }

    private addBuiltInEnums(snapshot: Snapshot): void {
        for (const het of hlslEnumTypes) {
            const ed: EnumDeclaration = {
                isBuiltIn: true,
                isClass: false,
                isVisible: false,
                members: [],
                originalRange: defaultRange,
                nameOriginalRange: defaultRange,
                uri: '',
                usages: [],
                name: het.name,
                type: het.type,
                description: het.description,
                links: het.links,
            };
            ed.members =
                het.members?.map((hemt) => ({
                    enumDeclaration: ed,
                    isVisible: false,
                    name: hemt.name,
                    nameOriginalRange: defaultRange,
                    originalRange: defaultRange,
                    uri: '',
                    usages: [],
                    value: hemt.value,
                    description: hemt.description,
                })) ?? [];
            snapshot.rootScope.enumDeclarations.push(ed);
        }
    }

    private addMacroDefinitions(snapshot: Snapshot): void {
        if (!this.document.uri.endsWith(HLSL_EXTENSION) && !this.document.uri.endsWith(HLSLI_EXTENSION)) {
            for (const md of snapshot.macroDeclarations.filter((md) => md.uri === snapshot.uri)) {
                try {
                    const contentSnapshot = md.contentSnapshot;
                    const lexer = createLexer(contentSnapshot.text);
                    const parser = this.createParser(lexer);
                    const tree = parser.dshl();
                    const visitor = new DshlVisitor(contentSnapshot, snapshot, md.contentOriginalRange.start);
                    visitor.visit(tree);
                    for (const fr of contentSnapshot.foldingRanges) {
                        offsetPosition(fr.start, md.contentOriginalRange.start);
                        offsetPosition(fr.end, md.contentOriginalRange.start);
                        snapshot.foldingRanges.push(fr);
                    }
                    for (const er of contentSnapshot.expressionRanges) {
                        offsetPosition(er.originalRange.start, md.contentOriginalRange.start);
                        offsetPosition(er.originalRange.end, md.contentOriginalRange.start);
                        snapshot.expressionRanges.push(er);
                    }
                    const macroScope: Scope = {
                        originalRange: contentSnapshot.rootScope.originalRange,
                        children: [contentSnapshot.rootScope],
                        shaderDeclarations: [],
                        shaderUsages: [],
                        typeDeclarations: [],
                        enumDeclarations: [],
                        enumMemberDeclarations: [],
                        typeUsages: [],
                        enumUsages: [],
                        enumMemberUsages: [],
                        variableDeclarations: [],
                        variableUsages: [],
                        functionUsages: [],
                        blockUsages: [],
                        macroDeclaration: md,
                        functionDeclarations: [],
                        parent: snapshot.rootScope,
                        isVisible: contentSnapshot.rootScope.isVisible,
                        hlslBlocks: [],
                        preshaders: [],
                    };
                    contentSnapshot.rootScope.parent = macroScope;
                    this.addElementsFromMacro(contentSnapshot.rootScope, md, true);
                    snapshot.rootScope.children.push(macroScope);
                } catch (e) {
                    // catching any error during the parsing to prevent the server from crashing
                }
            }
        }
    }

    private addElementsFromMacro(scope: Scope, md: MacroDeclaration, root: boolean): void {
        if (root) {
            scope.macroDeclaration = md;
        }
        const offset = md.contentOriginalRange.start;
        offsetPosition(scope.originalRange.start, offset);
        offsetPosition(scope.originalRange.end, offset);
        for (const sd of scope.shaderDeclarations) {
            offsetPosition(sd.originalRange.start, offset);
            offsetPosition(sd.originalRange.end, offset);
            offsetPosition(sd.nameOriginalRange.start, offset);
            offsetPosition(sd.nameOriginalRange.end, offset);
        }
        for (const su of scope.shaderUsages) {
            offsetPosition(su.originalRange.start, offset);
            offsetPosition(su.originalRange.end, offset);
        }
        this.offsetTypes(scope.typeDeclarations, offset);
        this.offsetEnums(scope.enumDeclarations, offset);
        for (const tu of scope.typeUsages) {
            offsetPosition(tu.originalRange.start, offset);
            offsetPosition(tu.originalRange.end, offset);
        }
        for (const eu of scope.enumUsages) {
            offsetPosition(eu.originalRange.start, offset);
            offsetPosition(eu.originalRange.end, offset);
        }
        for (const emu of scope.enumMemberUsages) {
            offsetPosition(emu.originalRange.start, offset);
            offsetPosition(emu.originalRange.end, offset);
        }
        for (const vd of scope.variableDeclarations) {
            offsetPosition(vd.originalRange.start, offset);
            offsetPosition(vd.originalRange.end, offset);
            offsetPosition(vd.nameOriginalRange.start, offset);
            offsetPosition(vd.nameOriginalRange.end, offset);
            if (vd.interval) {
                offsetPosition(vd.interval.nameOriginalRange.start, offset);
                offsetPosition(vd.interval.nameOriginalRange.end, offset);
            }
        }
        for (const vu of scope.variableUsages) {
            offsetPosition(vu.originalRange.start, offset);
            offsetPosition(vu.originalRange.end, offset);
        }
        for (const fu of scope.functionUsages) {
            offsetPosition(fu.originalRange.start, offset);
            offsetPosition(fu.originalRange.end, offset);
            offsetPosition(fu.nameOriginalRange.start, offset);
            offsetPosition(fu.nameOriginalRange.end, offset);
            offsetPosition(fu.parameterListOriginalRange.start, offset);
            offsetPosition(fu.parameterListOriginalRange.end, offset);
            for (const fa of fu.arguments) {
                offsetPosition(fa.originalRange.start, offset);
                offsetPosition(fa.originalRange.end, offset);
                offsetPosition(fa.trimmedOriginalStartPosition, offset);
            }
        }
        if (scope.blockDeclaration) {
            offsetPosition(scope.blockDeclaration.originalRange.start, offset);
            offsetPosition(scope.blockDeclaration.originalRange.end, offset);
        }
        if (scope.functionDeclaration) {
            offsetPosition(scope.functionDeclaration.originalRange.start, offset);
            offsetPosition(scope.functionDeclaration.originalRange.end, offset);
            offsetPosition(scope.functionDeclaration.nameOriginalRange.start, offset);
            offsetPosition(scope.functionDeclaration.nameOriginalRange.end, offset);
        }
        for (const bu of scope.blockUsages) {
            offsetPosition(bu.originalRange.start, offset);
            offsetPosition(bu.originalRange.end, offset);
        }
        for (const child of scope.children) {
            this.addElementsFromMacro(child, md, false);
        }
    }

    private offsetTypes(tds: TypeDeclaration[], offset: Position): void {
        for (const td of tds) {
            offsetPosition(td.originalRange.start, offset);
            offsetPosition(td.originalRange.end, offset);
            offsetPosition(td.nameOriginalRange.start, offset);
            offsetPosition(td.nameOriginalRange.end, offset);
            for (const m of td.members) {
                offsetPosition(m.originalRange.start, offset);
                offsetPosition(m.originalRange.end, offset);
                offsetPosition(m.nameOriginalRange.start, offset);
                offsetPosition(m.nameOriginalRange.end, offset);
            }
            this.offsetTypes(td.embeddedTypes, offset);
            this.offsetEnums(td.embeddedEnums, offset);
        }
    }

    private offsetEnums(eds: EnumDeclaration[], offset: Position): void {
        for (const ed of eds) {
            offsetPosition(ed.originalRange.start, offset);
            offsetPosition(ed.originalRange.end, offset);
            if (ed.nameOriginalRange) {
                offsetPosition(ed.nameOriginalRange.start, offset);
                offsetPosition(ed.nameOriginalRange.end, offset);
            }
            for (const m of ed.members) {
                offsetPosition(m.originalRange.start, offset);
                offsetPosition(m.originalRange.end, offset);
                offsetPosition(m.nameOriginalRange.start, offset);
                offsetPosition(m.nameOriginalRange.end, offset);
            }
        }
    }

    private createParser(lexer: DshlLexer): DshlParser {
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new DshlParser(tokenStream);
        parser.removeErrorListeners();
        return parser;
    }

    public opened(document: TextDocument): void {
        this.document = document;
        if (document.version < this.analyzedVersion.documentVersion) {
            this.analyzedVersion = invalidVersion;
            this.analyzationInProgressVersion = invalidVersion;
            this.analyzationInProgress = Promise.resolve();
        }
    }

    public closed(): void {
        this.lastTimeClosed = Date.now();
    }
}
