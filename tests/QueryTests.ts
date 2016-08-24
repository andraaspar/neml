/// <reference path='../typings/globals/jasmine/index.d.ts'/>

import Node from '../Node';
import Parser from '../Parser';
import Query from '../Query';
import Stringer from '../Stringer';

describe('Query', function() {
	var sampleData = Parser.parse(`{[|]}
[foo|A]
[bar|]
[baz|C]
[bar|D]
[quux|
	[|argle]
	[bargle|morple]
	[swoosh|]
]
[extra|
	[|]
	[2|]
]
`);
	var pq = new Query(sampleData);
	
	describe('.prototype.children()', function() {
		it('Selects child nodes.', function() {
			expect(pq.children().getNodes()).toEqual(sampleData.children);
		});
		it('Filters child nodes by name.', function() {
			expect(pq.children('bar').getNodes()).toEqual([sampleData.children[1], sampleData.children[3]]);
		});
		it('Filters child nodes by value.', function() {
			expect(pq.children(null, '').getNodes()).toEqual([sampleData.children[1]]);
		});
	});
	describe('.prototype.getLength()', function() {
		it('Returns the correct length of root.', function() {
			expect(pq.getLength()).toEqual(1);
		});
		it('Returns the correct length of children.', function() {
			expect(pq.children().getLength()).toEqual(6);
		});
	});
	describe('.prototype.getNodes()', function() {
		it('Returns the root in an array.', function() {
			expect(pq.getNodes()).toEqual([sampleData]);
		});
		it('Returns the original list of nodes of root’s children.', function() {
			expect(pq.children().getNodes()).toEqual(sampleData.children);
		});
	});
	describe('.prototype.getName()', function() {
		it('Returns an empty string for root’s name.', function() {
			expect(pq.getName()).toEqual('');
		});
		it('Returns the name of the first node from a list.', function() {
			expect(pq.children().getName()).toEqual('foo');
		});
	});
	describe('.prototype.getValue()', function() {
		it('Returns undefined for a branches value.', function() {
			expect(pq.getValue()).toEqual(undefined);
		});
		it('Returns the value of the first node of the list.', function() {
			expect(pq.children().getValue()).toEqual('A');
		});
	});
	describe('.prototype.getNames()', function() {
		it('Returns the names of all nodes as an array.', function() {
			expect(pq.children().getNames()).toEqual(['foo', 'bar', 'baz', 'bar', 'quux', 'extra']);
		});
	});
	describe('.prototype.getValues()', function() {
		it('Returns an empty array when no leaves are selected.', function() {
			expect(pq.getValues()).toEqual([]);
		});
		it('Returns each leaf value from a list of branches and leaves.', function() {
			expect(pq.children().getValues()).toEqual(['A', '', 'C', 'D']);
		});
	});
	describe('.prototype.getParentIndex()', function() {
		it('Returns -1 for root.', function() {
			expect(pq.getParentIndex()).toEqual(-1);
		});
		it('Returns the index of the first node.', function() {
			expect(pq.children().branches().getParentIndex()).toEqual(4);
		});
	});
	describe('.prototype.leaves()', function() {
		it('Filters to leaf nodes.', function() {
			expect(pq.children().leaves().getNodes()).toEqual(sampleData.children.slice(0, 4));
		});
	});
	describe('.prototype.branches()', function() {
		it('Filters to branch nodes.', function() {
			expect(pq.children().branches().getNodes()).toEqual(sampleData.children.slice(4, 6));
		});
	});
	describe('.prototype.descendants()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|
	[b|]
	[c|]
]
[d|
	[e|
		[f|]
	]
	[g|
		[h|]
	]
]
[i|]
`));
		it('Selects descendant nodes.', function() {
			expect(pq.descendants().getNames()).toEqual('abcdefghi'.split(''));
		});
		it('Filters descendant nodes by name.', function() {
			expect(pq.descendants('e').getNodes()).toEqual([d.children[1].children[0]]);
		});
		it('Filters descendant nodes by value.', function() {
			expect(pq.descendants(null, '').getNames()).toEqual('bcfhi'.split(''));
		});
	});
	describe('.prototype.parent()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|
	[b|1]
	[c|
		[d|1]
		[e|0]
	]
]
`));
		it('Selects parent node.', function() {
			expect(pq.descendants(null, '1').parent().getNames()).toEqual('ac'.split(''));
		});
		it('Filters parent node by name.', function() {
			expect(pq.descendants(null, '1').parent('c').getNodes()).toEqual([d.children[0].children[1]]);
		});
	});
	describe('.prototype.parents()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|
	[b|]
	[c|
		[d|
			[e|]
		]
	]
]
`));
		it('Selects parent nodes.', function() {
			expect(pq.descendants('e').parents().getNames()).toEqual(['d', 'c', 'a', '']);
		});
		it('Filters parent nodes by name.', function() {
			expect(pq.descendants('e').parents('c').getNodes()).toEqual([d.children[0].children[1]]);
		});
	});
	describe('.prototype.closest()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|
	[a|]
	[b|
		[c|
			[a|1]
			[d|1]
		]
		[d|1]
	]
]
`));
		it('Selects closest matching node.', function() {
			expect(pq.descendants(null, '1').closest('a').getNodes()).toEqual([d.children[0].children[1].children[0].children[0], d.children[0]]);
		});
	});
	describe('.prototype.byIndex()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|
	[b|]
]
[c|]
`));
		it('Selects the node at the specified index.', function() {
			expect(pq.descendants().byIndex(1).getNodes()).toEqual([d.children[0].children[0]]);
		});
	});
	describe('.prototype.first()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|
	[b|]
]
[c|]
`));
		it('Selects the first node.', function() {
			expect(pq.descendants().first().getNodes()).toEqual([d.children[0]]);
		});
	});
	describe('.prototype.last()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|
	[b|]
]
[c|]
`));
		it('Selects the last node.', function() {
			expect(pq.descendants().last().getNodes()).toEqual([d.children[1]]);
		});
	});
	describe('.prototype.root()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|
	[b|]
]
[c|]
`));
		it('Selects the root node.', function() {
			expect(pq.descendants('b').root().getNodes()).toEqual([d]);
		});
	});
	describe('.prototype.previousAll()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|]
[b|
	[c|]
	[d|]
	[e|
		[f|]
	]
	[g|]
	[h|]
]
[i|]
`));
		it('Selects previous siblings.', function() {
			expect(pq.descendants('g').previousAll().getNames()).toEqual('edc'.split(''));
		});
		it('Filters previous siblings by name.', function() {
			expect(pq.descendants('g').previousAll('e').getNodes()).toEqual([d.children[1].children[2]]);
		});
		it('Filters previous siblings by value.', function() {
			expect(pq.descendants('g').previousAll(null, '').getNodes()).toEqual([d.children[1].children[1], d.children[1].children[0]]);
		});
	});
	describe('.prototype.previous()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|]
[b|
	[c|]
	[d|1]
	[e|
		[f|]
	]
	[g|1]
	[h|]
]
[i|1]
`));
		it('Selects previous sibling.', function() {
			expect(pq.descendants(null, '1').previous().getNodes()).toEqual([d.children[1].children[0], d.children[1].children[2], d.children[1]]);
		});
		it('Filters previous sibling by name.', function() {
			expect(pq.descendants(null, '1').previous('e').getNodes()).toEqual([d.children[1].children[2]]);
		});
		it('Filters previous sibling by value.', function() {
			expect(pq.descendants(null, '1').previous(null, '').getNodes()).toEqual([d.children[1].children[0]]);
		});
	});
	describe('.prototype.previousUntil()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|]
[b|
	[c|2]
	[d|]
	[e|
		[f|]
	]
	[g|1]
	[h|]
]
[i|]
`));
		it('Selects previous siblings until the name matches.', function() {
			expect(pq.descendants(null, '1').previousUntil('c').getNames()).toEqual('ed'.split(''));
		});
		it('Filters previous siblings until the value matches.', function() {
			expect(pq.descendants(null, '1').previousUntil(null, '2').getNames()).toEqual('ed'.split(''));
		});
	});
	describe('.prototype.nextAll()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|]
[b|
	[c|]
	[d|]
	[e|
		[f|]
	]
	[g|]
	[h|]
]
[i|]
`));
		it('Selects next siblings.', function() {
			expect(pq.descendants('d').nextAll().getNames()).toEqual('egh'.split(''));
		});
		it('Filters next siblings by name.', function() {
			expect(pq.descendants('d').nextAll('e').getNodes()).toEqual([d.children[1].children[2]]);
		});
		it('Filters next siblings by value.', function() {
			expect(pq.descendants('d').nextAll(null, '').getNodes()).toEqual([d.children[1].children[3], d.children[1].children[4]]);
		});
	});
	describe('.prototype.next()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|1]
[b|
	[c|]
	[d|1]
	[e|
		[f|]
	]
	[g|1]
	[h|]
]
[i|]
`));
		it('Selects next sibling.', function() {
			expect(pq.descendants(null, '1').next().getNodes()).toEqual([d.children[1], d.children[1].children[2], d.children[1].children[4]]);
		});
		it('Filters next sibling by name.', function() {
			expect(pq.descendants(null, '1').next('e').getNodes()).toEqual([d.children[1].children[2]]);
		});
		it('Filters next sibling by value.', function() {
			expect(pq.descendants(null, '1').next(null, '').getNodes()).toEqual([d.children[1].children[4]]);
		});
	});
	describe('.prototype.nextUntil()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|]
[b|
	[c|]
	[d|1]
	[e|
		[f|]
	]
	[g|]
	[h|2]
]
[i|]
`));
		it('Selects next siblings until the name matches.', function() {
			expect(pq.descendants(null, '1').nextUntil('h').getNames()).toEqual('eg'.split(''));
		});
		it('Filters next siblings until the value matches.', function() {
			expect(pq.descendants(null, '1').nextUntil(null, '2').getNames()).toEqual('eg'.split(''));
		});
	});
	describe('.prototype.remove()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|]
[b|
	[a|
		[a|]
		[c|]
	]
	[d|]
	[a|]
]
[a|]
[a|]
[e|
	[a|]
]
`));
		var asPq = pq.descendants('a');
		asPq.remove();
		it('Removes selected nodes from their parents.', function() {
			expect(pq.descendants().getNames()).toEqual('bde'.split(''));
		});
		it('Fixes next sibling links in remaining nodes.', function() {
			expect(pq.descendants('b').getNode(0).nextSibling).toEqual(d.children[1]);
		});
		it('Unsets next sibling links in remaining nodes.', function() {
			expect(pq.descendants('d').getNode(0).nextSibling).toEqual(undefined);
		});
		it('Fixes previous sibling links in remaining nodes.', function() {
			expect(pq.descendants('e').getNode(0).previousSibling).toEqual(d.children[0]);
		});
		it('Unsets previous sibling links in remaining nodes.', function() {
			expect(pq.descendants('d').getNode(0).previousSibling).toEqual(undefined);
		});
		it('Gives branches a value when they have no child nodes left.', function() {
			expect(pq.descendants('e').getNode(0).value).toEqual('');
		});
		it('Unsets the children property of branches when they have no child nodes left.', function() {
			expect(pq.descendants('e').getNode(0).children).toEqual(undefined);
		});
		it('Unsets the parent property of removed nodes.', function() {
			expect(asPq.getNode(0).parent).toEqual(undefined);
		});
		it('Unsets the previous sibling link of removed nodes.', function() {
			expect(asPq.getNode(3).previousSibling).toEqual(undefined);
		});
		it('Unsets the next sibling link of removed nodes.', function() {
			expect(asPq.getNode(0).nextSibling).toEqual(undefined);
		});
	});
	describe('.prototype.add()', function() {
		var d: Node;
		var pq = new Query(d = Parser.parse(`{[|]}
[a|]
[b|
	[c|]
	[d|]
]
[e|]
`));
		var aq = new Query(Parser.parse('{[|]}[foo|bar][baz|]')).children();
		pq.descendants('b').merge(pq.descendants('c')).merge(pq.descendants('e')).add(aq);
		it('Adds nodes to selected parents.', function() {
			expect(Stringer.stringify(d)).toEqual(`{[|]}
[a|]
[b|
	[c|
		[foo|bar]
		[baz|]
	]
	[d|]
	[foo|bar]
	[baz|]
]
[e|
	[foo|bar]
	[baz|]
]`);
		});
		it('Moves the existing nodes to the first target.', function() {
			expect(pq.descendants('b').children().leaves().not('d').getNodes()).toEqual(aq.getNodes());
		});
		it('Clones the existing nodes to the remaining targets.', function() {
			expect(pq.descendants('c').children().getNodes()).not.toEqual(aq.getNodes());
		});
	});
});