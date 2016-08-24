import MessageKind from './MessageKind';

export default class Message {
	
	public charEnd: number;
	
	constructor(
		public kind: MessageKind,
		public line: number,
		public char: number,
		public message: string
		) {
		this.charEnd = this.char;
	}
	
	toString(showKind: boolean = false): string {
		return (showKind ? MessageKind[this.kind] + ': ' : '') + this.line + ':' + this.char + ': ' + this.message;
	}
}