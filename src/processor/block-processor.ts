import { Snapshot } from '../core/snapshot';
import { ElementRange } from '../interface/element-range';

export class BlockProcesor {
    private snapshot: Snapshot;
    private index = -1;
    private character = '';
    private lastCharacterIsEscape = false;
    private curlyBrackets = 0;
    private stringLiteral = false;
    private characterLiteral = false;
    private insideBlock = false;
    private blockStartPosition = -1;

    public constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
    }

    public getBlock(startPosition: number, offset = 0): ElementRange | null {
        for (this.index = startPosition; this.index < this.snapshot.text.length; this.index++) {
            this.setCharacter(this.snapshot.text);
            if (this.isCharacterWhitespace()) {
                continue;
            }
            if (this.isBlockStart()) {
                this.insideBlock = true;
                this.blockStartPosition = this.index + 1;
            } else if (this.isBlockEnd()) {
                return {
                    startPosition: offset + this.blockStartPosition,
                    endPosition: offset + this.index,
                };
            } else if (this.insideBlock) {
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
        return this.character === ' ' || this.character === '\t' || this.character === '\n' || this.character === '\r';
    }

    private isBlockStart(): boolean {
        return !this.insideBlock && this.character === '{';
    }

    private isBlockEnd(): boolean {
        return (
            this.character === '}' &&
            this.curlyBrackets === 0 &&
            this.insideBlock &&
            !this.stringLiteral &&
            !this.characterLiteral
        );
    }

    private handleCharacters(): void {
        if (this.character === '"' && !this.lastCharacterIsEscape) {
            this.stringLiteral = !this.stringLiteral;
        } else if (this.character === "'" && !this.lastCharacterIsEscape) {
            this.characterLiteral = !this.characterLiteral;
        } else if (!this.stringLiteral && !this.characterLiteral) {
            if (this.character === '{') {
                this.curlyBrackets++;
            } else if (this.character === '}') {
                this.curlyBrackets--;
            }
        }
    }
}
