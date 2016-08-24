import Message from './Message';
import MessageKind from './MessageKind';
import ReaderBase from './ReaderBase';

export default class Tidier extends ReaderBase {

	private indentChar: string = '\t';
	private eolChar: string = '\n';
	private convertIgnoredValueToNode: boolean = false;
	
	private charId: number;
	private valueBuffer = '';
	private hasChildren: boolean[] = [];
	private commentLevel = 0;
	private level = 0;
	private inName = false;
	private inIgnoredValue = false;

	constructor() {
		super();
	}

	tidy(src: string): string {
		this.readDelimiters(src);
		this.checkDelimiters();
		
		// Normalize line ends
		src = src.replace(/\r\n|\r|\n/g, '\n');
		
		this.charId = 0;
		this.valueBuffer = '';
		this.hasChildren = [];
		this.commentLevel = 0;
		this.level = 0;
		this.inName = false;
		this.inIgnoredValue = false;

		var result = this.tidyLoop(src);
		
		if (this.commentLevel > 0) {
			this.addTidyMessage(MessageKind.WARNING, result, 'Added ' + this.commentLevel + ' missing comment end delimiter(s).');
			for (var i = 0; i < this.commentLevel; i++) {
				src += this.getCommentEnd();
			}
			result = this.tidyLoop(src, result);
		}
		if (this.level > 0) {
			this.addTidyMessage(MessageKind.WARNING, result, 'Added ' + this.level + ' missing node end delimiter(s).');
			for (var i = 0; i < this.level; i++) {
				src += this.getNodeEnd();
			}
			result = this.tidyLoop(src, result);
		}
		
		// Set EOL
		result = result.replace('\n', this.eolChar);

		return result;
	}

	protected tidyLoop(src: string, result: string = ''): string {
		
		var commentStart = this.getCommentStart();
		var commentEnd = this.getCommentEnd();
		var nodeStart = this.getNodeStart();
		var nameEnd = this.getNameEnd();
		var nodeEnd = this.getNodeEnd();
		
		if (this.level == 0 && this.charId == 0) {
			this.hasChildren[this.level] = this.checkAheadForChildren(src);
		}

		for (var n = src.length; this.charId < n; this.charId++) {
			var char = src.charAt(this.charId);

			if (char == commentStart) {

				if (this.inIgnoredValue) {
					result = this.endIgnoredValueConversion(result);
				}

				this.commentLevel++;
				if (this.commentLevel == 1) {
					if (!this.inName) {
						if (result && this.hasChildren[this.level]) {
							// Result check ensures header characters stay at the start
							result += '\n' + this.getIndent(this.level);
						}
					}
				}
				if (this.hasChildren[this.level]) {
					result += char;
				} else {
					this.valueBuffer = this.valueBuffer.replace(/^[\s\n]+/g, '');
					if (this.valueBuffer) {
						this.valueBuffer += char;
					} else {
						result += char;
					}
				}

			} else if (char == commentEnd) {

				if (this.commentLevel > 0) {
					// Ignore invalid comment end delimiters
					
					this.commentLevel--;
					if (this.hasChildren[this.level]) {
						result += char;
					} else {
						if (this.valueBuffer) {
							this.valueBuffer += char;
						} else {
							result += char;
						}
					}
				} else {
					this.addTidyMessage(MessageKind.WARNING, result, 'Invalid comment end delimiter removed.');
				}

			} else if (this.commentLevel > 0) {

				if (this.inName) {
					result += char;
				} else {
					if (this.valueBuffer) {
						this.valueBuffer += char;
					} else {
						result += char;
					}
				}

			} else {
				if (char == nodeStart) {

					if (this.inIgnoredValue) {
						result = this.endIgnoredValueConversion(result);
					}
					this.hasChildren[this.level] = true;
					if (this.inName) {
						result = result.replace(/[\s\n]+$/g, '');
						this.addTidyMessage(MessageKind.WARNING, result, 'Added missing name end delimiter.');
						result += nameEnd;
					}
					this.inName = true;
					result += '\n' + this.getIndent(this.level);
					result += char;
					this.level++;

					this.hasChildren[this.level] = this.checkAheadForChildren(src);

				} else if (char == nameEnd) {

					this.inName = false;
					result += char;

				} else if (char == nodeEnd) {

					if (this.inName) {
						this.addTidyMessage(MessageKind.WARNING, result, 'Added missing name end delimiter.');
						result += nameEnd;
					} else if (this.inIgnoredValue) {
						result = this.endIgnoredValueConversion(result);
					}
					if (this.level) {
						// Valid closing char
						if (this.hasChildren[this.level]) {
							result += '\n' + this.getIndent(this.level - 1);
						} else {
							result += this.valueBuffer;
							this.valueBuffer = '';
						}
						result += char;

						this.hasChildren[this.level] = false;
						this.level--;
						this.inName = false;
					} else {
						this.addTidyMessage(MessageKind.WARNING, result, 'Invalid node end delimiter removed.');
					}

				} else {


					if (this.inName) {

						result += char;

					} else if (this.inIgnoredValue) {

						result += char;

					} else {

						if (this.hasChildren[this.level]) {

							if (/\s/.test(char)) {
								// Ignore white space
							} else {
								this.inIgnoredValue = true;
								this.inName = false;
								result += '\n' + this.getIndent(this.level);
								this.addTidyMessage(MessageKind.WARNING, result,
									'Ignored value found and converted to a ' + (this.convertIgnoredValueToNode ? 'node' : 'comment') + '.');
								if (this.convertIgnoredValueToNode) {
									result += nodeStart + nameEnd;
								} else {
									result += commentStart;
								}
								result += char;
							}

						} else {

							this.valueBuffer += char;

						}

					}

				}
			}

		}
		
		return result;
	}
	
	protected addTidyMessage(kind: MessageKind, result: string, message: string): void {
		var lineNo = 1;
		var charNo = 1;
		var lineBreaks = result.match(/\n/g);
		if (lineBreaks) {
			lineNo = lineBreaks.length + 1;
		}
		var lastLineChars = (/\n(.*?)$/g).exec(result);
		if (lastLineChars) {
			charNo = lastLineChars[0].length;
		}
		this.addMessage(new Message(kind, lineNo, charNo, message));
	}
	
	protected endIgnoredValueConversion(result: string): string {
		result = result.replace(/[\s\n]+$/g, '');
		if (this.convertIgnoredValueToNode) {
			result += this.getNodeEnd();
		} else {
			result += this.getCommentEnd();
		}
		this.inIgnoredValue = false;
		return result;
	}

	protected getIndent(level: number): string {
		var result = '';
		for (var i = 0; i < level; i++) {
			result += this.indentChar;
		}
		return result;
	}

	protected checkAheadForChildren(src: string): boolean {
		var result = false;

		var commentLevel = 0;
		
		var commentStart = this.getCommentStart();
		var commentEnd = this.getCommentEnd();
		var nodeStart = this.getNodeStart();
		var nodeEnd = this.getNodeEnd();

		for (var i = this.charId + 1, n = src.length; i < n; i++) {
			var char = src.charAt(i);

			if (char == commentStart) {

				commentLevel++;

			} else if (char == commentEnd) {

				commentLevel--;

			} else if (commentLevel <= 0) {

				if (char == nodeStart) {

					result = true;
					break;

				} else if (char == nodeEnd) {

					result = false;
					break;

				}
			}
		}
		return result;
	}

	getConvertIgnoredValueToNode(): boolean {
		return this.convertIgnoredValueToNode;
	}

	setConvertIgnoredValueToNode(v: boolean): void {
		this.convertIgnoredValueToNode = v;
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
}