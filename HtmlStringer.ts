import ArrayUtil from 'illa/ArrayUtil';
import {
	bind
} from 'illa/FunctionUtil';
import StringUtil from 'illa/StringUtil';

import HtmlHandler from './HtmlHandler';
import Node from './Node';
import Query from './Query';

export default class HtmlStringer extends HtmlHandler {
	
	private CHAR_TO_HTML: { [s: string]: string } = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;' // IE8 does not support &apos;
	};

	private prettyPrint: boolean = true;
	private indentChar: string = '\t';
	private eolChar: string = '\n';
	private tabExpansion: string = '    ';
	private expandLineBreaks: boolean = false;
	private expandTabs: boolean = false;

	constructor() {
		super();
	}
	
	stringify(src: Node | Node[] | Query, level = 0): string {
		let result = '';
		if (src instanceof Node) {
			result += this.stringifyNode(src, level);
		} else {
			if (src instanceof Query) {
				src = src.getNodes();
			}
			for (let i = 0, n = src.length; i < n; i++) {
				result += this.stringifyNode(src[i], level);
			}
		}
		return result;
	}

	protected stringifyNode(src: Node, level = 0): string {
		var result = '';
		
		var indent = '';
		for (var i = 0; i < level; i++) {
			indent += this.indentChar;
		}

		if (src.parent && src.name == '') {
			// If text node
			
			result += this.prepareText(src, indent);

		} else if (src.name.charAt(0) != this.getAttributeChar()) {
			// If not attribute
			
			var startsWithExclamationMark = src.name.charAt(0) == '!';
			var isComment = src.name == '!--';
			var startsWithQuestionMark = src.name.charAt(0) == '?';
			var hasEnd = this.checkHasEnd(src);
			var isBlock = this.checkIsBlock(src);
			

			if (src.parent) {
				// If not root
				
				if (this.prettyPrint) {
					if (isBlock || this.checkIsBlock(src.previousSibling)) {
						// Add EOL + indent if block or previous was block
						result += this.eolChar;
						result += indent;
					}
				}
				
				// Render start tag
				
				result += '<';
				result += this.escapeHtml(src.name);

				if (src.children) {
					// Render attributes
					
					for (var i = 0, n = src.children.length; i < n; i++) {
						var child = src.children[i];
						if (child.name.charAt(0) == this.getAttributeChar()) {
							var attributeName = child.name.slice(1);
							if (attributeName || child.value) result += ' ';
							
							// Attribute name is not required for old DOCTYPE support
							
							if (attributeName) {
								result += this.escapeHtml(attributeName);
							}
							if (child.value) {
								if (attributeName) result += '=';
								if (child.value.indexOf('"') > -1 && child.value.indexOf("'") == -1) {
									result += "'" + this.escapeHtml(child.value, "'") + "'";
								} else {
									result += '"' + this.escapeHtml(child.value, '"') + '"';
								}
							}
						}
					}
				}
				
				// Render start tag end
				
				if (startsWithQuestionMark) result += '?';
				if (!hasEnd && !startsWithExclamationMark) result += '/';
				if (!isComment) result += '>';
			}

			if (hasEnd || isComment) {
				if (src.children) {
					for (var i = 0, n = src.children.length; i < n; i++) {
						var child = src.children[i];
						result += this.stringifyNode(child, level + 1);
					}
				} else {
					result += this.prepareText(src, indent);
				}
			}

			if (src.parent && hasEnd) {
				if (this.prettyPrint) {
					if (this.checkHasBlockContent(src)) {
						result += this.eolChar;
						result += indent;
					}
				}

				result += '</';
				result += this.escapeHtml(src.name);
				result += '>';
			}

			if (isComment) {
				result += '-->';
			}
		}

		return result;
	}

	protected prepareText(src: Node, indent: string): string {
		var result = src.value || '';
		if (!this.checkIsNonReplaceableCharacterTag(src)) {
			result = this.escapeHtml(result, '');
			if (this.expandLineBreaks && !this.checkIsNoLineBreakExpansionTag(src)) {
				var breakTag = '<br/>';
				if (this.prettyPrint && !this.checkIsPreformattedTag(src)) {
					breakTag += this.eolChar + indent;
				}
				result = result.replace(/(?:\r\n|\n|\r)/g, breakTag);
			}
			if (this.expandTabs) {
				result = result.replace(/\t/g, this.tabExpansion);
			}
		}
		return result;
	}

	protected escapeHtml(str: string, quotes: string = '"\''): string {
		return str.replace(new RegExp('[&<>' + quotes + ']', 'g'), this.replaceCallbackBound);
	}
	
	private replaceCallbackBound = bind(this.replaceCallback, this);
	protected replaceCallback(s: string): string {
		return this.CHAR_TO_HTML[s];
	}

	getPrettyPrint(): boolean {
		return this.prettyPrint;
	}

	setPrettyPrint(v: boolean): this {
		this.prettyPrint = v;
		return this;
	}

	getIndentChar(): string {
		return this.indentChar;
	}

	setIndentChar(v: string): this {
		this.indentChar = v;
		return this;
	}

	getEolChar(): string {
		return this.eolChar;
	}

	setEolChar(v: string): this {
		this.eolChar = v;
		return this;
	}

	getTabExpansion(): string {
		return this.tabExpansion;
	}

	setTabExpansion(v: string): this {
		this.tabExpansion = v;
		return this;
	}
	
	getExpandLineBreaks(): boolean {
		return this.expandLineBreaks;
	}
	
	setExpandLineBreaks(v: boolean): this {
		this.expandLineBreaks = v;
		return this;
	}
	
	getExpandTabs(): boolean {
		return this.expandTabs;
	}
	
	setExpandTabs(v: boolean): this {
		this.expandTabs = v;
		return this;
	}
}