import { MacroArguments } from '../interface/macro/macro-parameters';

export class MacroArgumentsProcesor {
    text: string;
    index = -1;
    character = '';
    lastCharacterIsEscape = false;
    roundedBrackets = 0;
    stringLiteral = false;
    characterLiteral = false;
    insideArguments = false;
    argumentPosition = -1;
    arguments: string[] = [];

    public constructor(text: string) {
        this.text = text;
    }

    public getMacroArguments(
        identifierEndPosition: number
    ): MacroArguments | null {
        for (
            this.index = identifierEndPosition;
            this.index < this.text.length;
            this.index++
        ) {
            this.setCharacter(this.text);
            if (this.isCharacterWhitespace()) {
                continue;
            }
            if (this.isParametersStart()) {
                this.insideArguments = true;
                this.argumentPosition = this.index + 1;
            } else if (this.isParametersEnd()) {
                this.addArgumentIfExists();
                return {
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
        if (this.argumentPosition !== -1) {
            const argument = this.text
                .substring(this.argumentPosition, this.index)
                .trim();
            if (argument) {
                this.arguments.push(argument);
            }
        }
    }

    private handleCharacters(): void {
        if (this.character === '"' && !this.lastCharacterIsEscape) {
            this.stringLiteral = !this.stringLiteral;
        } else if (this.character === "'" && !this.lastCharacterIsEscape) {
            this.characterLiteral = !this.characterLiteral;
        } else if (!this.stringLiteral && !this.characterLiteral) {
            if (this.isArgumentSeparatorComma()) {
                this.addArgumentIfExists();
                this.argumentPosition = this.index + 1;
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
