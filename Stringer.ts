import ArrayUtil from 'illa/ArrayUtil';

import Node from './Node';

export default class Stringer {
	
	private commentStart: string;
	private nodeStart: string;
	private nameEnd: string;
	private nodeEnd: string;
	private commentEnd: string;
	
	private prettyPrint: boolean = true;
	private indentChar: string = '\t';
	private eolChar: string = '\n';

	constructor(
		private preferredSeparatorPairs: string[] = ['{}', '[]', '()', '<>', '«»', '◄►', '├┤', '╠╣'],
		private preferredSingleSeparators: string[] = ['|', '\\', '~', '•', '→', '⁞', '▪', '╪']
		) {

	}
	
	static stringify(src: Node | Node[]): string {
		return new Stringer().stringify(src);
	}
	
	stringify(src: Node | Node[]): string {
		let result = '';
		if (src instanceof Node) {
			result += this.stringifyInternal(src);
		} else {
			for (let i = 0, n = src.length; i < n; i++) {
				let node = src[i];
				result += this.stringifyInternal(node);
			}
		}
		return result;
	}

	protected stringifyInternal(src: Node, level = -1): string {
		this.checkSeparators(src);
		
		var result = '';
		var indent = '';
		if (src.parent) {
			// Only indent node if it is not the root
			if (this.prettyPrint) {
				result += this.eolChar;
				for (var i = 0; i < level; i++) {
					indent += this.indentChar;
				}
				result += indent;
			}
			
			// Only render node if it is not the root
			result += this.nodeStart + src.name + this.nameEnd;
		} else {
			// For the root node, render the header characters
			result += this.commentStart + this.nodeStart + this.nameEnd + this.nodeEnd + this.commentEnd;
		}
		if (this.hasChildren(src)) {
			for (var i = 0, n = src.children.length; i < n; i++) {
				result += this.stringifyInternal(src.children[i], level + 1);
			}
		} else {
			result += src.value;
		}
		if (src.parent) {
			if (this.hasChildren(src)) {
				// If has children, put EOL before node end
				result += this.eolChar;
				result += indent;
			}
			// If not root, add node end
			result += this.nodeEnd;
		}
		return result;
	}
	
	private hasChildren(src: Node): boolean {
		return src.children && src.children.length > 0;
	}

	private checkSeparators(src: Node): void {
		var unsafeIndex = this.checkAreSeparatorsSafe(src);
		while (unsafeIndex > -1) {
			switch (unsafeIndex) {
				case 0:
				case 4:
					var newNode = this.getNewSeparatorPair(src);
					this.commentStart = newNode[0];
					this.commentEnd = newNode[1];
					break;
				case 1:
				case 3:
					var newNode = this.getNewSeparatorPair(src);
					this.nodeStart = newNode[0];
					this.nodeEnd = newNode[1];
					break;
				case 2:
					this.nameEnd = this.getNewSingleSeparator(src);
					break;
				default:
					throw 'Invalid index.';
			}
			unsafeIndex = this.checkAreSeparatorsSafe(src);
		}
	}
	
	private getSeparators(): string[] {
		return [this.commentStart, this.nodeStart, this.nameEnd, this.nodeEnd, this.commentEnd];
	}
	
	private checkAreSeparatorsSafe(src: Node): number {
		var separators = this.getSeparators();
		for (var i = 0, n = separators.length; i < n; i++) {
			var separator = separators[i];
			if (!this.checkSeparatorIsValid(separators, separator) || !this.checkIsCharacterSafeForContent(src, separator)) {
				return i;
			}
		}
		return -1;
	}
	
	private checkSeparatorIsValid(separators: string[], separator: string): boolean {
		if (!separator || separator.length != 1 || /[\s\u00a0\u00ad\r\n]/.test(separator)) {
			return false;
		}
		var index = ArrayUtil.indexOf(separators, separator);
		if (index > -1) {
			var index2 = ArrayUtil.indexOf(separators, separator, index + 1);
			if (index2 > -1) {
				return false;
			}
		}
		return true;
	}
	
	private getNewSeparatorPair(src: Node): [string, string] {
		var separators = this.getSeparators();
		var result: [string, string];
		var isValid = false;
		for (var i = 0, n = this.preferredSeparatorPairs.length; i < n; i++) {
			var preferredSeparatorPair = this.preferredSeparatorPairs[i];
			result = [preferredSeparatorPair.charAt(0), preferredSeparatorPair.charAt(1)];
			var separatorsPlusResult = separators.concat(result);
			isValid = this.checkSeparatorIsValid(separatorsPlusResult, result[0]) &&
				this.checkSeparatorIsValid(separatorsPlusResult, result[1]) &&
				this.checkIsCharacterSafeForContent(src, result[0]) &&
				this.checkIsCharacterSafeForContent(src, result[1]);
			if (isValid) break;
		}
		while (!isValid) {
			separators = separators.concat(result);
			var resultA = this.getNewSeparator(separators);
			result = [resultA, String.fromCharCode(resultA.charCodeAt(0) + 1)];
			isValid = this.checkSeparatorIsValid(separators, result[0]) &&
				this.checkSeparatorIsValid(separators, result[1]) &&
				this.checkIsCharacterSafeForContent(src, result[0]) &&
				this.checkIsCharacterSafeForContent(src, result[1]);
		}
		return result;
	}
	
	private getNewSingleSeparator(src: Node): string {
		var separators = this.getSeparators();
		var result: string;
		var isValid = false;
		for (var i = 0, n = this.preferredSingleSeparators.length; i < n; i++) {
			result = this.preferredSingleSeparators[i].charAt(0);
			var separatorsPlusResult = separators.concat(result);
			isValid = this.checkSeparatorIsValid(separatorsPlusResult, result) &&
				this.checkIsCharacterSafeForContent(src, result);
			if (isValid) break;
		}
		while (!isValid) {
			separators = separators.concat(result);
			result = this.getNewSeparator(separators);
			isValid = this.checkSeparatorIsValid(separators, result) &&
				this.checkIsCharacterSafeForContent(src, result);
		}
		return result;
	}
	
	private findFallbackSeparators(src: Node): void {
		while (!this.checkIsCharacterSafeForContent(src, this.commentStart)) {
			this.commentStart = this.getNewCharacter(this.commentStart);
		}
		while (!this.checkIsCharacterSafeForContent(src, this.nodeStart)) {
			this.nodeStart = this.getNewCharacter(this.nodeStart);
		}
		while (!this.checkIsCharacterSafeForContent(src, this.nameEnd)) {
			this.nameEnd = this.getNewCharacter(this.nameEnd);
		}
		while (!this.checkIsCharacterSafeForContent(src, this.nodeEnd)) {
			this.nodeEnd = this.getNewCharacter(this.nodeEnd);
		}
		while (!this.checkIsCharacterSafeForContent(src, this.commentEnd)) {
			this.commentEnd = this.getNewCharacter(this.commentEnd);
		}
	}

	private checkIsCharacterSafeForContent(src: Node, c: string): boolean {
		if (src.name.indexOf(c) == -1) {
			if (this.hasChildren(src)) {
				for (var i = 0, n = src.children.length; i < n; i++) {
					if (!this.checkIsCharacterSafeForContent(src.children[i], c)) {
						return false;
					}
				}
				return true;
			} else {
				return src.value.indexOf(c) == -1;
			}
		}
		return false;
	}

	private getNewCharacter(prevChar: string): string {
		var charCodes = [
			this.commentStart.charCodeAt(0),
			this.nodeStart.charCodeAt(0),
			this.nameEnd.charCodeAt(0),
			this.nodeEnd.charCodeAt(0),
			this.commentEnd.charCodeAt(0)
		];
		var charCode = prevChar.charCodeAt(0);
		do {
			charCode++;
		} while (ArrayUtil.indexOf(charCodes, charCode) != -1);
		return String.fromCharCode(charCode);
	}
	
	private getNewSeparator(separators: string[]): string {
		var highestCharCode = '\u00a0'.charCodeAt(0);
		for (var i = 0, n = separators.length; i < n; i++) {
			var separator = separators[i];
			highestCharCode = Math.max(highestCharCode, (separator ? separator.charCodeAt(0) : 0));
		}
		return String.fromCharCode(highestCharCode + 1);
	}
	
	getPrettyPrint(): boolean {
		return this.prettyPrint;
	}
	
	setPrettyPrint(v: boolean): void {
		this.prettyPrint = v;
	}
	
	getIndentChar(): string {
		return this.indentChar;
	}
	
	setIndentChar(v: string): void {
		this.indentChar = v;
	}
	
	getEolChar(): string {
		return this.eolChar;
	}
	
	setEolChar(v: string): void {
		this.eolChar = v;
	}
	
	getPreferredSeparatorPairs(): string[] {
		return this.preferredSeparatorPairs;
	}
	
	setPreferredSeparatorPairs(v: string[]): void {
		this.preferredSeparatorPairs = v;
	}
	
	getPreferredSingleSeparators(): string[] {
		return this.preferredSingleSeparators;
	}
	
	setPreferredSingleSeparators(v: string[]): void {
		this.preferredSingleSeparators = v;
	}
}