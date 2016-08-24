export default class Node {
	name: string;
	value: string;
	children: Node[];
	parent: Node;
	nextSibling: Node;
	previousSibling: Node;
}