import ArrayUtil from 'illa/ArrayUtil';
import Log from 'illa/Log';

import Message from './Message';
import MessageKind from './MessageKind';

export default class ReaderBase {
	
	private commentStart: string;
	private nodeStart: string;
	private nameEnd: string;
	private nodeEnd: string;
	private commentEnd: string;

	private messages: Message[] = [];
	private logMessages: boolean = true;
	private throwOnError: boolean = true;
	
	constructor() {
		
	}
	
	protected readDelimiters(source: string): void {
		this.commentStart = source.slice(0, 1);
		this.nodeStart = source.slice(1, 2);
		this.nameEnd = source.slice(2, 3);
		this.nodeEnd = source.slice(3, 4);
		this.commentEnd = source.slice(4, 5);
		
		this.checkDelimiters();
	}

	protected checkDelimiters(): void {
		var delimiters = this.getDelimiters();
		var names = ['Comment start', 'Node start', 'Name end', 'Node end', 'Comment end'];
		for (var i = 0, n = delimiters.length; i < n; i++) {
			if (!delimiters[i]) {
				this.addMessage(new Message(MessageKind.ERROR, 1, i + 1, names[i] + ' delimiter is missing.'));
			}
			if (/[\s \r\n]/.test(delimiters[i])) {
				this.addMessage(new Message(MessageKind.ERROR, 1, i + 1, names[i] + ' delimiter is a whitespace or line break character.'));
			}
			var i2 = ArrayUtil.indexOf(delimiters, delimiters[i], i + 1);
			if (i2 > -1) {
				this.addMessage(new Message(MessageKind.ERROR, 1, i + 1, names[i] + ' delimiter clashes with ' + names[i2].toLowerCase() + ' delimiter.'));
			}
		}
	}
	
	getCommentStart(): string {
		return this.commentStart;
	}
	
	getNodeStart(): string {
		return this.nodeStart;
	}
	
	getNameEnd(): string {
		return this.nameEnd;
	}
	
	getNodeEnd(): string {
		return this.nodeEnd;
	}
	
	getCommentEnd(): string {
		return this.commentEnd;
	}
	
	getMessages(): Message[] {
		return this.messages;
	}
	
	getLogMessages(): boolean {
		return this.logMessages;
	}
	
	setLogMessages(v: boolean): void {
		this.logMessages = v;
	}
	
	protected clearMessages(): void {
		this.messages = [];
	}
	
	protected addMessage(m: Message): void {
		this.messages.push(m);
		
		if (this.getThrowOnError() && m.kind == MessageKind.ERROR) {
			throw m.toString();
		}
		
		if (this.logMessages) {
			switch (m.kind) {
				case MessageKind.ERROR:
					Log.error(m.toString());
					break;
				case MessageKind.WARNING:
					Log.warn(m.toString());
					break;
				case MessageKind.INFO:
					Log.info(m.toString());
					break;
				default:
					Log.log(m.toString());
			}
		}
	}
	
	getMessageKindCount(kind: MessageKind): number {
		var count = 0;
		for (var i = 0, n = this.messages.length; i < n; i++) {
			if (this.messages[i].kind === kind) {
				
			}
		}
		return count;
	}
	
	getDelimiters(): string[] {
		return [this.commentStart, this.nodeStart, this.nameEnd, this.nodeEnd, this.commentEnd];
	}
	
	getThrowOnError(): boolean {
		return this.throwOnError;
	}
	
	setThrowOnError(v: boolean): void {
		this.throwOnError = v;
	}
}