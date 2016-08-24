import Node from '../Node';

export function addNodeToParent(node: Node, parent: Node): void {
	node.parent = parent;
	var previousSibling = parent.children[parent.children.length - 1];
	if (previousSibling) {
		node.previousSibling = previousSibling;
	}
	if (node.previousSibling) {
		node.previousSibling.nextSibling = node;
	}
	parent.children.push(node);
}

export function createNode(name: string, parent?: Node): Node {
	var result = new Node();
	result.name = name;
	if (parent) {
		addNodeToParent(result, parent);
	}
	result.children = [];
	return result;
}

export function createLeaf(name: string, value: string, parent?: Node): Node {
	var result = new Node();
	result.name = name;
	result.value = value;
	if (parent) {
		addNodeToParent(result, parent);
	}
	return result;
}