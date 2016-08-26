import ArrayUtil from 'illa/ArrayUtil';
import StringUtil from 'illa/StringUtil';
import Type from 'illa/Type';

import Node from './Node';

export default class Query {
	
	private nodes: Node[];
	
	constructor(nodeOrNodes: Node|Node[]|Query) {
		if (nodeOrNodes instanceof Query) {
			this.nodes = nodeOrNodes.nodes;
		} else if (Type.isArray(nodeOrNodes)) {
			this.nodes = nodeOrNodes;
		} else {
			this.nodes = [<Node>nodeOrNodes];
		}
	}
	
	getNodes(): Node[] {
		return this.nodes;
	}
	
	getNode(index: number): Node {
		return this.nodes[index];
	}
	
	getLength(): number {
		return this.nodes.length;
	}
	
	getName(): string {
		if (this.nodes[0]) {
			return this.nodes[0].name;
		} else {
			return undefined;
		}
	}
	
	setName(name: string): void {
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			node.name = name;
		}
	}
	
	getValue(): string {
		return Query.getValue(this.nodes[0]);
	}
	
	setValue(value: string): void {
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			Query.setValue(node, value);
		}
	}
	
	getNames(): string[] {
		var result: string[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			result.push(node.name);
		}
		return result;
	}
	
	getValues(): string[] {
		var result: string[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			var value = Query.getValue(node);
			if (Type.isString(value)) result.push(value);
		}
		return result;
	}
	
	leaves(): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			if (Query.getIsLeaf(node)) result.push(node);
		}
		return new Query(result);
	}
	
	branches(): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			if (!Query.getIsLeaf(node)) result.push(node);
		}
		return new Query(result);
	}
	
	descendants(name?: string, value?: string, childrenOnly?: boolean): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			result = result.concat(Query.getDescendantNodes(node, name, value, childrenOnly));
		}
		result = this.removeDoubles(result);
		return new Query(result);
	}
	
	children(name?: string, value?: string): Query {
		return this.descendants(name, value, true);
	}
	
	parent(name?: string): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			if (Query.getDoesMatch(node.parent, name)) {
				result.push(node.parent);
			}
		}
		result = this.removeDoubles(result);
		return new Query(result);
	}
	
	parents(name?: string): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			result = result.concat(Query.getParentNodes(node, name));
		}
		result = this.removeDoubles(result);
		return new Query(result);
	}
	
	closest(name: string): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			var closest = Query.getClosestNode(node, name);
			if (closest) result.push(closest);
		}
		result = this.removeDoubles(result);
		return new Query(result);
	}
	
	byIndex(index: number): Query {
		var node = this.nodes[index];
		if (node) {
			return new Query([node]);
		} else {
			return new Query([]);
		}
	}
	
	first(): Query {
		return this.byIndex(0);
	}
	
	last(): Query {
		return this.byIndex(this.nodes.length - 1);
	}
	
	root(): Query {
		var current = this.nodes[0];
		while (current.parent) {
			current = current.parent;
		}
		return new Query([current]);
	}
	
	getParentIndex(): number {
		return Query.getIndex(this.nodes[0]);
	}
	
	previousAll(name?: string, value?: string, checkFirstOnly?: boolean, isUntil?: boolean): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			for (var index = Query.getIndex(node) - 1; index >= 0; index--) {
				var sibling = node.parent.children[index];
				if (Query.getDoesMatch(sibling, name, value)) {
					if (isUntil) break;
					else result.push(sibling);
				} else {
					if (isUntil) result.push(sibling);
				}
				if (checkFirstOnly) break;
			}
		}
		result = this.removeDoubles(result);
		return new Query(result);
	}
	
	previous(name?: string, value?: string): Query {
		return this.previousAll(name, value, true);
	}
	
	previousUntil(name: string, value?: string): Query {
		return this.previousAll(name, value, false, true);
	}
	
	nextAll(name?: string, value?: string, checkFirstOnly?: boolean, isUntil?: boolean): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			var index = Query.getIndex(node);
			if (index >= 0) {
				var length = node.parent ? node.parent.children.length : 0;
				for (index += 1; index < length; index++) {
					var sibling = node.parent.children[index];
					if (Query.getDoesMatch(sibling, name, value)) {
						if (isUntil) break;
						else result.push(sibling);
					} else {
						if (isUntil) result.push(sibling);
					}
					if (checkFirstOnly) break;
				}
			}
		}
		result = this.removeDoubles(result);
		return new Query(result);
	}
	
	next(name?: string, value?: string): Query {
		return this.nextAll(name, value, true);
	}
	
	nextUntil(name: string, value?: string): Query {
		return this.nextAll(name, value, false, true);
	}
	
	remove(): void {
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			Query.removeNode(node);
		}
	}
	
	add(childOrChildren: Node|Node[]|Query, index?: number): void {
		var toAdd: Node[];
		if (childOrChildren instanceof Node) {
			toAdd = [childOrChildren];
		} else if (childOrChildren instanceof Query) {
			toAdd = childOrChildren.nodes;
		} else {
			toAdd = (<Node[]>childOrChildren).slice(0);
		}
		if (!Type.isNumber(index)) {
			index = toAdd.length;
		}
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var parent = this.nodes[i];
			for (var j = 0, o = toAdd.length; j < o; j++) {
				var child = toAdd[j];
				if (i > 0) {
					child = Query.cloneNode(child);
				}
				Query.addChildNode(parent, child, index + j);
			}
		}
	}
	
	merge(other: Query): Query {
		return new Query(this.removeDoubles(this.nodes.concat(other.nodes)));
	}
	
	clone(): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			result.push(Query.cloneNode(node));
		}
		return new Query(result);
	}
	
	filter(name: string, value?: string, negate?: boolean): Query {
		var result: Node[] = [];
		for (var i = 0, n = this.nodes.length; i < n; i++) {
			var node = this.nodes[i];
			if (Query.getDoesMatch(node, name, value) != negate) {
				result.push(node);
			}
		}
		return new Query(result);
	}
	
	not(name: string, value?: string): Query {
		return this.filter(name, value, true);
	}
	
	protected removeDoubles<T>(arr: T[]): T[] {
		var result: T[] = [];
		for (var i = 0, n = arr.length; i < n; i++) {
			var item = arr[i];
			if (ArrayUtil.indexOf(result, item) < 0) {
				result.push(item);
			}
		}
		return result;
	}
	
	static getValue(node: Node): string {
		if (this.getIsLeaf(node)) {
			return StringUtil.castNicely(node.value);
		} else {
			return undefined;
		}
	}
	
	static setValue(node: Node, value: string): void {
		this.removeChildNodes(node);
		node.value = value;
	}
	
	static cloneNode(node: Node): Node {
		var cloned = new Node();
		cloned.name = node.name;
		if (this.getIsLeaf(node)) {
			cloned.value = node.value;
		} else {
			cloned.children = [];
			var lastClonedChild: Node;
			for (var i = 0, n = node.children.length; i < n; i++) {
				var child = node.children[i];
				var clonedChild = this.cloneNode(child);
				cloned.children.push(clonedChild);
				if (lastClonedChild) {
					clonedChild.previousSibling = lastClonedChild;
					lastClonedChild.nextSibling = clonedChild;
				}
				lastClonedChild = clonedChild;
			}
		}
		return cloned;
	}
	
	static getIsLeaf(node: Node): boolean {
		return !(node.children && node.children.length);
	}
	
	static getIsRoot(node: Node): boolean {
		return !node.parent;
	}
	
	static getDescendantNodes(node: Node, name?: string, value?: string, childrenOnly = false): Node[] {
		var testName = Type.isString(name);
		var testValue = Type.isString(value);
		var nodes: Node[] = [];
		if (node.children) {
			for (var i = 0, n = node.children.length; i < n; i++) {
				var child = node.children[i];
				if (this.getDoesMatch(child, name, value)) {
					nodes.push(child);
				}
				if (!childrenOnly) nodes = nodes.concat(this.getDescendantNodes(child, name, value));
			}
		}
		return nodes;
	}
	
	static getChildNodes(node: Node, name?: string, value?: string): Node[] {
		return this.getDescendantNodes(node, name, value, true);
	}
	
	static getDoesMatch(node: Node, name?: string, value?: string): boolean {
		var testName = Type.isString(name);
		var testValue = Type.isString(value);
		if (testValue && !this.getIsLeaf(node)) {
			return false;
		}
		if (testName && testValue) {
			return node.name == name && this.getValue(node) == value;
		} else if (testName) {
			return node.name == name;
		} else if (testValue) {
			return this.getValue(node) == value;
		} else {
			return true;
		}
	}
	
	static getParentNodes(node: Node, name?: string): Node[] {
		var result: Node[] = [];
		var currentNode = node;
		while (!this.getIsRoot(currentNode)) {
			currentNode = currentNode.parent;
			if (this.getDoesMatch(currentNode, name)) {
				result.push(currentNode);
			}
		}
		return result;
	}
	
	static getClosestNode(node: Node, name: string): Node {
		if (this.getDoesMatch(node, name)) {
			return node;
		} else if (this.getIsRoot(node)) {
			return undefined;
		} else {
			return this.getClosestNode(node.parent, name);
		}
	}
	
	static getIndex(node: Node): number {
		var result = -1;
		if (node && node.parent) {
			result = ArrayUtil.indexOf(node.parent.children, node);
		}
		return result;
	}
	
	static removeNode(node: Node): void {
		if (node) {
			if (node.parent) {
				var index = this.getIndex(node);
				if (index >= 0) {
					var siblings = node.parent.children;
					var previousSibling = siblings[index - 1];
					var nextSibling = siblings[index + 1];
					if (previousSibling) previousSibling.nextSibling = nextSibling;
					if (nextSibling) nextSibling.previousSibling = previousSibling;
					siblings.splice(index, 1);
					if (!siblings.length) {
						node.parent.children = undefined;
						node.parent.value = '';
					}
				}
			}
			node.parent = node.previousSibling = node.nextSibling = undefined;
		}
	}
	
	static removeChildNodes(node: Node): void {
		if (node && node.children) {
			for (var i = 0, n = node.children.length; i < n; i++) {
				var child = node.children[i];
				child.parent = child.previousSibling = child.nextSibling = undefined;
			}
			node.children = undefined;
		}
	}
	
	static hasClosestNode(node: Node, parent: Node): boolean {
		while (node) {
			if (node === parent) {
				return true;
			}
			node = node.parent;
		}
		return false;
	}
	
	static addChildNode(parent: Node, child: Node, index?: number): void {
		if (this.hasClosestNode(parent, child)) {
			throw 'Must not introduce circular reference.';
		}
		if (child.parent) this.removeNode(child);
		if (!parent.children) {
			parent.children = [];
			parent.value = undefined;
		}
		if (!Type.isNumber(index)) {
			index = parent.children.length;
		}
		index = Math.max(0, Math.min(parent.children.length, index));
		
		child.previousSibling = parent.children[index - 1];
		child.nextSibling = parent.children[index];
		if (child.previousSibling) child.previousSibling.nextSibling = child;
		if (child.nextSibling) child.nextSibling.previousSibling = child;
		child.parent = parent;
		
		parent.children.splice(index, 0, child);
	}
}