import { Token } from 'antlr4ts';
import { Position } from 'vscode-languageserver';
import { ExpressionContext } from '../_generated/DshlParser';
import { Snapshot } from '../core/snapshot';
import { Scope } from '../helper/scope';
import { ExpressionRange } from '../interface/expression-range';
import { ExpressionResult } from '../interface/expression-result';
import { EnumDeclaration } from '../interface/type/enum-declaration';
import { EnumMemberUsage } from '../interface/type/enum-member-usage';
import { EnumUsage } from '../interface/type/enum-usage';
import { TypeDeclaration } from '../interface/type/type-declaration';
import { TypeUsage } from '../interface/type/type-usage';
import { VariableDeclaration } from '../interface/variable/variable-declaration';
import { VariableUsage } from '../interface/variable/variable-usage';

export class ExpressionVisitor {
    private ctx!: ExpressionContext;
    private snapshot: Snapshot;
    private scope: Scope;
    private rootSnapshot?: Snapshot;
    private contentStartPosition?: Position;
    private enum?: EnumDeclaration;

    public constructor(
        snapshot: Snapshot,
        scope: Scope,
        rootSnapshot?: Snapshot,
        contentStartPosition?: Position,
        enumx?: EnumDeclaration
    ) {
        this.snapshot = snapshot;
        this.scope = scope;
        this.rootSnapshot = rootSnapshot;
        this.contentStartPosition = contentStartPosition;
        this.enum = enumx;
    }

    public visitExpression(ctx: ExpressionContext): ExpressionResult | null {
        this.ctx = ctx;
        const visible = this.isVisible(this.ctx.start.startIndex);
        let result: ExpressionResult | null = null;
        const dot = this.ctx.DOT();
        const doubleColon = this.ctx.DOUBLE_COLON();
        const identifier = this.ctx.hlsl_identifier();
        if (visible) {
            if (identifier && !dot && !doubleColon) {
                const position = identifier.start.startIndex;
                const originalPosition = this.snapshot.getOriginalPosition(position, true);
                const vd = this.snapshot.getVariableDeclarationFor(identifier.text, originalPosition);
                const emd = this.snapshot.getEnumMemberDeclarationFor(identifier.text, originalPosition);
                const td = this.snapshot.getTypeDeclarationFor(identifier.text, originalPosition);
                const ed = this.snapshot.getEnumDeclarationFor(identifier.text, originalPosition);
                if (vd) {
                    this.createVariableUsage(vd, identifier.start, visible);
                    if (vd.typeDeclaration) {
                        result = { type: 'type', typeDeclaration: vd.typeDeclaration, arraySizes: vd.arraySizes };
                    }
                } else if (emd) {
                    const emu: EnumMemberUsage = {
                        declaration: emd,
                        originalRange: this.snapshot.getOriginalRange(
                            identifier.start.startIndex,
                            identifier.stop!.stopIndex + 1
                        ),
                        isVisible: visible,
                    };
                    this.scope.enumMemberUsages.push(emu);
                    emd.usages.push(emu);
                } else if (td) {
                    const tu: TypeUsage = {
                        declaration: td,
                        originalRange: this.snapshot.getOriginalRange(
                            identifier.start.startIndex,
                            identifier.stop!.stopIndex + 1
                        ),
                        isVisible: visible,
                    };
                    this.scope.typeUsages.push(tu);
                    td.usages.push(tu);
                    result = { type: 'type', typeDeclaration: td, arraySizes: [] };
                } else if (ed) {
                    const eu: EnumUsage = {
                        declaration: ed,
                        originalRange: this.snapshot.getOriginalRange(
                            identifier.start.startIndex,
                            identifier.stop!.stopIndex + 1
                        ),
                        isVisible: visible,
                    };
                    this.scope.enumUsages.push(eu);
                    ed.usages.push(eu);
                    result = { type: 'enum', enumDeclaration: ed, arraySizes: [] };
                } else if (this.enum) {
                    const emd = this.enum.members.find((m) => m.name === identifier.text);
                    if (emd) {
                        const emu: EnumMemberUsage = {
                            declaration: emd,
                            originalRange: this.snapshot.getOriginalRange(
                                identifier.start.startIndex,
                                identifier.stop!.stopIndex + 1
                            ),
                            isVisible: visible,
                        };
                        this.scope.enumMemberUsages.push(emu);
                        emd.usages.push(emu);
                    }
                } else if (this.rootSnapshot && this.contentStartPosition) {
                    const vd = this.rootSnapshot.getVariableDeclarationFor(
                        identifier.text,
                        this.contentStartPosition,
                        true
                    );
                    const emd = this.rootSnapshot.getEnumMemberDeclarationFor(
                        identifier.text,
                        this.contentStartPosition,
                        true
                    );
                    const td = this.rootSnapshot.getTypeDeclarationFor(
                        identifier.text,
                        this.contentStartPosition,
                        true
                    );
                    const ed = this.rootSnapshot.getEnumDeclarationFor(
                        identifier.text,
                        this.contentStartPosition,
                        true
                    );
                    if (vd) {
                        this.createVariableUsage(vd, identifier.start, visible);
                        if (vd.typeDeclaration) {
                            result = { type: 'type', typeDeclaration: vd.typeDeclaration, arraySizes: vd.arraySizes };
                        }
                    } else if (emd) {
                        const emu: EnumMemberUsage = {
                            declaration: emd,
                            originalRange: this.snapshot.getOriginalRange(
                                identifier.start.startIndex,
                                identifier.stop!.stopIndex + 1
                            ),
                            isVisible: visible,
                        };
                        this.rootSnapshot.rootScope.enumMemberUsages.push(emu);
                        this.scope.enumMemberUsages.push(emu);
                        emd.usages.push(emu);
                    } else if (td) {
                        const tu: TypeUsage = {
                            declaration: td,
                            originalRange: this.snapshot.getOriginalRange(
                                identifier.start.startIndex,
                                identifier.stop!.stopIndex + 1
                            ),
                            isVisible: visible,
                        };
                        this.scope.typeUsages.push(tu);
                        td.usages.push(tu);
                        result = { type: 'type', typeDeclaration: td, arraySizes: [] };
                    } else if (ed) {
                        const eu: EnumUsage = {
                            declaration: ed,
                            originalRange: this.snapshot.getOriginalRange(
                                identifier.start.startIndex,
                                identifier.stop!.stopIndex + 1
                            ),
                            isVisible: visible,
                        };
                        this.scope.enumUsages.push(eu);
                        ed.usages.push(eu);
                        result = { type: 'enum', enumDeclaration: ed, arraySizes: [] };
                    }
                }
            } else if (dot) {
                const exp = this.ctx.expression(0);
                const expResult = new ExpressionVisitor(
                    this.snapshot,
                    this.scope,
                    this.rootSnapshot,
                    this.contentStartPosition,
                    this.enum
                ).visitExpression(exp);
                if (expResult?.type === 'type') {
                    const range = this.snapshot.getOriginalRange(dot.symbol.startIndex, ctx.stop!.stopIndex + 1);
                    const er: ExpressionRange = {
                        type: 'type',
                        originalRange: range,
                        typeDeclaration: expResult.typeDeclaration,
                    };
                    this.snapshot.expressionRanges.push(er);
                    if (identifier) {
                        const m = this.findMember(expResult.typeDeclaration, identifier.text);
                        if (m) {
                            this.createVariableUsage(m, identifier.start, visible);
                            if (m.typeDeclaration) {
                                result = { type: 'type', typeDeclaration: m.typeDeclaration, arraySizes: [] };
                            }
                        }
                    }
                }
            } else if (doubleColon) {
                const exp = this.ctx.expression(0);
                const expResult = new ExpressionVisitor(
                    this.snapshot,
                    this.scope,
                    this.rootSnapshot,
                    this.contentStartPosition,
                    this.enum
                ).visitExpression(exp); //this.visit(exp);
                if (expResult) {
                    const range = this.snapshot.getOriginalRange(
                        doubleColon.symbol.startIndex,
                        ctx.stop!.stopIndex + 1
                    );
                    if (expResult.type === 'type') {
                        const er: ExpressionRange = {
                            type: 'type',
                            originalRange: range,
                            typeDeclaration: expResult.typeDeclaration,
                        };
                        this.snapshot.expressionRanges.push(er);
                    } else {
                        const er: ExpressionRange = {
                            type: 'enum',
                            originalRange: range,
                            enumDeclaration: expResult.enumDeclaration,
                        };
                        this.snapshot.expressionRanges.push(er);
                    }
                    if (identifier) {
                        if (expResult.type === 'type') {
                            const etd = expResult.typeDeclaration.embeddedTypes.find(
                                (etd) => etd.name === identifier.text
                            );
                            const eed = expResult.typeDeclaration.embeddedEnums.find(
                                (eed) => eed.name === identifier.text
                            );
                            const emd = expResult.typeDeclaration.embeddedEnums
                                .filter((eed) => !eed.name)
                                .flatMap((eed) => eed.members)
                                .find((emd) => emd.name === identifier.text);
                            if (etd) {
                                const tu: TypeUsage = {
                                    declaration: etd,
                                    isVisible: visible,
                                    originalRange: this.snapshot.getOriginalRange(
                                        identifier.start.startIndex,
                                        identifier.stop!.stopIndex + 1
                                    ),
                                };
                                this.scope.typeUsages.push(tu);
                                etd.usages.push(tu);
                                const er: ExpressionRange = {
                                    type: 'type',
                                    originalRange: range,
                                    typeDeclaration: expResult.typeDeclaration,
                                };
                                this.snapshot.expressionRanges.push(er);
                                result = { type: 'type', typeDeclaration: etd, arraySizes: [] };
                            } else if (eed) {
                                const eu: EnumUsage = {
                                    declaration: eed,
                                    isVisible: visible,
                                    originalRange: this.snapshot.getOriginalRange(
                                        identifier.start.startIndex,
                                        identifier.stop!.stopIndex + 1
                                    ),
                                };
                                this.scope.enumUsages.push(eu);
                                eed.usages.push(eu);
                                const er: ExpressionRange = {
                                    type: 'type',
                                    originalRange: range,
                                    typeDeclaration: expResult.typeDeclaration,
                                };
                                this.snapshot.expressionRanges.push(er);
                                result = { type: 'enum', enumDeclaration: eed, arraySizes: [] };
                            } else if (emd) {
                                const emu: EnumMemberUsage = {
                                    declaration: emd,
                                    isVisible: visible,
                                    originalRange: this.snapshot.getOriginalRange(
                                        identifier.start.startIndex,
                                        identifier.stop!.stopIndex + 1
                                    ),
                                };
                                this.scope.enumMemberUsages.push(emu);
                                emd.usages.push(emu);
                            }
                        } else {
                            const emd = expResult.enumDeclaration.members.find((m) => m.name === identifier.text);
                            if (emd) {
                                const emu: EnumMemberUsage = {
                                    declaration: emd,
                                    originalRange: this.snapshot.getOriginalRange(
                                        identifier.start.startIndex,
                                        identifier.stop!.stopIndex + 1
                                    ),
                                    isVisible: visible,
                                };
                                this.scope.enumMemberUsages.push(emu);
                                emd.usages.push(emu);
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    private findMember(td: TypeDeclaration, name: string): VariableDeclaration | null {
        const vd = td.members.find((m) => m.name === name);
        if (vd) {
            return vd;
        }
        for (const superTd of td.superTypes) {
            const vd = this.findMember(superTd, name);
            if (vd) {
                return vd;
            }
        }
        return null;
    }

    private createVariableUsage(vd: VariableDeclaration, identifier: Token, visible: boolean): VariableUsage {
        const vu: VariableUsage = {
            declaration: vd,
            originalRange: this.snapshot.getOriginalRange(identifier.startIndex, identifier.stopIndex + 1),
            isVisible: visible,
        };
        this.scope.variableUsages.push(vu);
        vd.usages.push(vu);
        return vu;
    }

    private isVisible(position: number): boolean {
        return (
            !this.snapshot.isInIncludeContext(position) &&
            !this.snapshot.isInMacroContext(position) &&
            !this.snapshot.isInDefineContext(position)
        );
    }
}
