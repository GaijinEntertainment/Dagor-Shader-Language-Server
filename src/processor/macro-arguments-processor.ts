import { Snapshot } from '../core/snapshot';
import { MacroArgument } from '../interface/macro/macro-argument';
import { MacroArguments } from '../interface/macro/macro-arguments';

export class MacroArgumentsProcesor {
    private snapshot: Snapshot;
    private index = -1;
    private character = '';
    private lastCharacterIsEscape = false;
    private roundedBrackets = 0;
    private stringLiteral = false;
    private characterLiteral = false;
    private insideArguments = false;
    private argumentListStartPosition = -1;
    private argumentIdentifierPosition = -1;
    private argumentSeparatorPosition = -1;
    private arguments: MacroArgument[] = [];

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
    }

    public getMacroArguments(
        identifierEndPosition: number
    ): MacroArguments | null {
        for (
            this.index = identifierEndPosition;
            this.index < this.snapshot.text.length;
            this.index++
        ) {
            this.setCharacter(this.snapshot.text);
            if (this.isCharacterWhitespace()) {
                continue;
            }
            if (this.isParametersStart()) {
                this.insideArguments = true;
                this.argumentListStartPosition = this.index + 1;
                this.argumentSeparatorPosition = this.index + 1;
            } else if (this.isParametersEnd()) {
                this.addArgumentIfExists();
                return {
                    argumentListOriginalRange: this.snapshot.getOriginalRange(
                        this.argumentListStartPosition,
                        this.index
                    ),
                    endPosition: this.index + 1,
                    arguments: this.arguments,
                };
            } else if (this.insideArguments) {
                this.handleCharacters();
            } else {
                return null;
            }
        }
        return null;
    }

    private setCharacter(text: string): void {
        if (this.index !== 0) {
            this.lastCharacterIsEscape = text[this.index - 1] === '\\';
        }
        this.character = text[this.index];
    }

    private isCharacterWhitespace(): boolean {
        return (
            this.character === ' ' ||
            this.character === '\t' ||
            this.character === '\n' ||
            this.character === '\r'
        );
    }

    private isParametersStart(): boolean {
        return !this.insideArguments && this.character === '(';
    }

    private isParametersEnd(): boolean {
        return (
            this.character === ')' &&
            this.roundedBrackets === 0 &&
            this.insideArguments &&
            !this.stringLiteral &&
            !this.characterLiteral
        );
    }

    private addArgumentIfExists(): void {
        if (this.argumentIdentifierPosition !== -1) {
            const argument = this.snapshot.text
                .substring(this.argumentIdentifierPosition, this.index)
                .trim();
            if (argument) {
                this.arguments.push({
                    content: argument,
                    originalRange: this.snapshot.getOriginalRange(
                        this.argumentSeparatorPosition,
                        this.index
                    ),
                    trimmedOriginalStartPosition:
                        this.snapshot.getOriginalPosition(
                            this.argumentIdentifierPosition
                        ),
                });
            }
        }
    }

    private handleCharacters(): void {
        if (this.argumentIdentifierPosition === -1) {
            this.argumentIdentifierPosition = this.index;
        }
        if (this.character === '"' && !this.lastCharacterIsEscape) {
            this.stringLiteral = !this.stringLiteral;
        } else if (this.character === "'" && !this.lastCharacterIsEscape) {
            this.characterLiteral = !this.characterLiteral;
        } else if (!this.stringLiteral && !this.characterLiteral) {
            if (this.isArgumentSeparatorComma()) {
                this.addArgumentIfExists();
                this.argumentIdentifierPosition = -1;
                this.argumentSeparatorPosition = this.index + 1;
            } else if (this.character === '(') {
                this.roundedBrackets++;
            } else if (this.character === ')') {
                this.roundedBrackets--;
            }
        }
    }

    private isArgumentSeparatorComma(): boolean {
        return this.character === ',' && this.roundedBrackets === 0;
    }
}
