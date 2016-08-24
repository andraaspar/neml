import ReaderBase from './ReaderBase';
import Linter from './Linter';
import Node from './Node';

export default class Parser extends ReaderBase {
	
	private static instance: Parser;
	
	private source: string;
	
	private linter: Linter;
	private doesLint: boolean = true;
	
	constructor() {
		super();
		this.linter = new Linter();
		this.linter.setThrowOnError(true);
		this.linter.setLogMessages(true);
	}
	
	static getInstance(): Parser {
		if (!this.instance) {
			this.instance = new Parser();
		}
		return this.instance;
	}
	
	static parse(src: string): Node {
		return this.getInstance().parse(src);
	}
	
	parse(src: string): Node {
		this.source = src;
		
		this.linter.lint(this.source);
		// If it did not throw, we can proceed.
		
		this.readDelimiters(this.source);
		var commentlessSource = this.removeComments(this.source);
		return this.readNodes(commentlessSource);
	}
	
	protected removeComments(src: string): string {
		var commentSplit = src.split(this.getCommentStart());
		var commentlessSrc = commentSplit[0];
		var commentDepth = 0;
		
		for (var i = 1, n = commentSplit.length; i < n; i++) {
			commentDepth++;
			var sectionSplit = commentSplit[i].split(this.getCommentEnd());
			commentDepth -= sectionSplit.length - 1;
			if (commentDepth == 0) {
				commentlessSrc += sectionSplit[sectionSplit.length - 1];
			}
		}
		
		return commentlessSrc;
	}
	
	protected readNodes(src: string): Node {
		var rootNode = new Node();
		rootNode.name = '';
		rootNode.children = [];
		
		var splitSrc = src.split(this.getNodeStart());
		var parentNode = rootNode;
		var previousNode: Node;
		
		for (var i = 1, n = splitSrc.length; i < n; i++) {
			var node = new Node();
			var tailSplit = splitSrc[i].split(this.getNodeEnd());
			var hasChildren = tailSplit.length == 1;
			var parentsClosed = tailSplit.length - 2;
			this.readNodeContent(node, tailSplit[0], hasChildren);
			parentNode.children.push(node);
			node.parent = parentNode;
			if (previousNode) {
				previousNode.nextSibling = node;
				node.previousSibling = previousNode;
			}
			previousNode = node;
			if (hasChildren) {
				node.children = [];
				parentNode = node;
				previousNode = null;
			} else {
				while (parentsClosed) {
					previousNode = parentNode;
					parentNode = parentNode.parent;
					parentsClosed--;
				}
			}
		}
		
		return rootNode;
	}
	
	protected readNodeContent(node: Node, src: string, hasChildren: boolean): void {
		var contentSplit = src.split(this.getNameEnd());
		node.name = contentSplit[0];
		if (!hasChildren) {
			node.value = contentSplit[1] || '';
		}
	}
	
	getDoesLint(): boolean {
		return this.doesLint;
	}
	
	setDoesLint(v: boolean): void {
		this.doesLint = v;
	}
	
	getLinter(): Linter {
		return this.linter;
	}
}