import ArrayUtil from 'illa/ArrayUtil';

import Node from './Node';

export default class HtmlHandler {
	
	private noEndTags: string[] = [
		'area',
		'base',
		'br',
		'col',
		'embed',
		'hr',
		'img',
		'input',
		'keygen',
		'link',
		'meta',
		'param',
		'source',
		'track',
		'wbr'
	];
	private inlineTags: string[] = [
		'b',
		'big',
		'i',
		'small',
		'tt',
		'abbr',
		'acronym',
		'cite',
		'code',
		'dfn',
		'em',
		'kbd',
		'strong',
		'samp',
		'var',
		'bdo',
		'br',
		'img',
		'map',
		'object',
		'q',
		//'script', // Not inline for formatting purposes
		'span',
		'sub',
		'sup',
		'button',
		'input',
		'label',
		'select'
	];
	private inlineDependingOnContentTags: string[] = [
		'a'
	];
	private nonReplaceableCharacterTags: string[] = [
		'!--',
		'script',
		'style'
	];
	private preformattedTags: string[] = [
		'pre'
	];
	private noLineBreakExpansionTags: string[] = [
		'!--',
		'title'
	];
	
	private attributeChar: string = '@';
	
	constructor() {
		
	}

	protected checkIsPreformattedTag(src: Node): boolean {
		if (!src) return false;
		return ArrayUtil.indexOf(this.preformattedTags, src.name) > -1 || this.checkIsPreformattedTag(src.parent);
	}

	protected checkIsNoLineBreakExpansionTag(src: Node): boolean {
		if (!src) return false;
		return ArrayUtil.indexOf(this.noLineBreakExpansionTags, src.name) > -1 || this.checkIsNoLineBreakExpansionTag(src.parent);
	}

	protected checkIsNonReplaceableCharacterTag(src: Node): boolean {
		if (!src) return false;
		return ArrayUtil.indexOf(this.nonReplaceableCharacterTags, src.name) > -1 || this.checkIsNonReplaceableCharacterTag(src.parent);
	}

	protected checkIsInlineDependingOnContent(src: Node): boolean {
		if (!src) return false;
		return ArrayUtil.indexOf(this.inlineDependingOnContentTags, src.name) > -1;
	}

	protected checkIsBlock(src: Node): boolean {
		if (!src) return false;
		switch (src.name.charAt(0)) {
			case '':
			case this.attributeChar:
			case '!':
			case '?':
				return false;
		}
		if (this.checkIsInlineDependingOnContent(src)) {
			return this.checkHasBlockContent(src);
		} else {
			return ArrayUtil.indexOf(this.inlineTags, src.name) == -1;
		}
	}

	protected checkHasBlockContent(src: Node): boolean {
		if (this.hasChildren(src)) {
			for (var i = 0, n = src.children.length; i < n; i++) {
				var child = src.children[i];
				if (this.checkIsBlock(child)) {
					return true;
				}
			}
		}
		return false;
	}

	protected checkHasEnd(src: Node): boolean {
		var startsWithExclamationMark = src.name.charAt(0) == '!';
		var startsWithQuestionMark = src.name.charAt(0) == '?';
		return !startsWithExclamationMark && !startsWithQuestionMark && ArrayUtil.indexOf(this.noEndTags, src.name) == -1;
	}
	
	protected hasChildren(node: Node): boolean {
		return node && node.children && node.children.length > 0;
	}
	
	protected checkIsIgnored(node: Node): boolean {
		switch (node.name.charAt(0)) {
			case this.attributeChar:
			case '!':
			case '?':
				return true;
		}
		if (node.name == '' && /^[\s\n]*$/g.test(node.value)) {
			return true;
		}
		return false;
	}
	
	protected getUnignoredNextSibling(node: Node): Node {
		while (node.nextSibling && this.checkIsIgnored(node.nextSibling)) {
			node = node.nextSibling;
		}
		return node.nextSibling;
	}
	
	protected getUnignoredPreviousSibling(node: Node): Node {
		while (node.previousSibling && this.checkIsIgnored(node.previousSibling)) {
			node = node.previousSibling;
		}
		return node.previousSibling;
	}
	
	getNoEndTags(): string[] {
		return this.noEndTags;
	}
	
	setNoEndTags(v: string[]): void {
		this.noEndTags = v;
	}
	
	getInlineTags(): string[] {
		return this.inlineTags;
	}
	
	setInlineTags(v: string[]): void {
		this.inlineTags = v;
	}
	
	getInlineDependingOnContentTags(): string[] {
		return this.inlineDependingOnContentTags;
	}
	
	setInlineDependingOnContentTags(v: string[]): void {
		this.inlineDependingOnContentTags = v;
	}
	
	getNonReplaceableCharacterTags(): string[] {
		return this.nonReplaceableCharacterTags;
	}
	
	setNonReplaceableCharacterTags(v: string[]): void {
		this.nonReplaceableCharacterTags = v;
	}
	
	getPreformattedTags(): string[] {
		return this.preformattedTags;
	}
	
	setPreformattedTags(v: string[]): void {
		this.preformattedTags = v;
	}
	
	getNoLineBreakExpansionTags(): string[] {
		return this.noLineBreakExpansionTags;
	}
	
	setNoLineBreakExpansionTags(v: string[]): void {
		this.noLineBreakExpansionTags = v;
	}
	
	getAttributeChar(): string {
		return this.attributeChar;
	}
	
	setAttributeChar(v: string): void {
		this.attributeChar = v;
	}
}