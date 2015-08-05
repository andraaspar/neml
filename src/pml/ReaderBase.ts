/// <reference path='../../lib/illa/Log.ts'/>

/// <reference path='Message.ts'/>

module pml {
	export class ReaderBase {
		
		private commentStart: string;
		private tagStart: string;
		private valueDelimiter: string;
		private tagEnd: string;
		private commentEnd: string;

		private messages: Message[] = [];
		private logMessages: boolean = true;
		private throwOnError: boolean = true;
		
		constructor() {
			
		}
		
		protected readDelimiters(source: string): void {
			this.commentStart = source.slice(0, 1);
			this.tagStart = source.slice(1, 2);
			this.valueDelimiter = source.slice(2, 3);
			this.tagEnd = source.slice(3, 4);
			this.commentEnd = source.slice(4, 5);
			
			this.checkDelimiters();
		}

		protected checkDelimiters(): void {
			var delimiters = this.getDelimiters();
			var names = ['Comment start', 'Tag start', 'Value', 'Tag end', 'Comment end'];
			for (var i = 0, n = delimiters.length; i < n; i++) {
				if (!delimiters[i]) {
					this.addMessage(new Message(MessageKind.ERROR, 0, i, names[i] + ' delimiter is missing.'));
				}
				if (/[\s \r\n]/.test(delimiters[i])) {
					this.addMessage(new Message(MessageKind.ERROR, 0, i, names[i] + ' delimiter is a whitespace or line break character.'));
				}
				var i2 = illa.ArrayUtil.indexOf(delimiters, delimiters[i], i + 1);
				if (i2 > -1) {
					this.addMessage(new Message(MessageKind.ERROR, 0, i, names[i] + ' delimiter clashes with ' + names[i2] + ' delimiter.'));
				}
			}
		}
		
		getCommentStart(): string {
			return this.commentStart;
		}
		
		getTagStart(): string {
			return this.tagStart;
		}
		
		getValueDelimiter(): string {
			return this.valueDelimiter;
		}
		
		getTagEnd(): string {
			return this.tagEnd;
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
						illa.Log.error(m.toString());
						break;
					case MessageKind.WARNING:
						illa.Log.warn(m.toString());
						break;
					case MessageKind.INFO:
						illa.Log.info(m.toString());
						break;
					default:
						illa.Log.log(m.toString());
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
			return [this.commentStart, this.tagStart, this.valueDelimiter, this.tagEnd, this.commentEnd];
		}
		
		getThrowOnError(): boolean {
			return this.throwOnError;
		}
		
		setThrowOnError(v: boolean): void {
			this.throwOnError = v;
		}
	}
}