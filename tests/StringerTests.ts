/// <reference path='../typings/globals/jasmine/index.d.ts'/>

import {
	createLeaf,
	createNode
} from './NodeHelpers';

import Stringer from '../Stringer';

describe('Stringer', function() {
	describe('.stringify()', function() {
		it('stringifies pml', function() {
			var data = createNode('');
			createLeaf('Árvíztűrő tükörfúrógép', 'Flood-resistant mirror drill', data);
			createLeaf('', '', data);
			var root = createNode('root', data);
			createLeaf('leaf-1', 'A', root);
			var leaf2 = createNode('leaf-2', root);
			createLeaf('', 'B', leaf2);
			createLeaf('', 'b', leaf2);
			createLeaf('leaf-3', 'C', root);
			
			var result = Stringer.stringify(data);
			
			expect(result).toEqual(`{[|]}
[Árvíztűrő tükörfúrógép|Flood-resistant mirror drill]
[|]
[root|
	[leaf-1|A]
	[leaf-2|
		[|B]
		[|b]
	]
	[leaf-3|C]
]`);
		});
		it('finds a new name end delimiter when the current is used by the data', function() {
			var data = createNode('');
			createLeaf('', '|', data);
			
			var result = Stringer.stringify(data);
			expect(result).toEqual('{[\\]}\n[\\|]');
		});
		it('finds new comment delimiters when the current is used by the data', function() {
			var data = createNode('');
			createLeaf('', '{', data);
			
			var result = Stringer.stringify(data);
			expect(result).toEqual('[(|)]\n(|{)');
		});
		it('finds new tag delimiters when the current is used by the data', function() {
			var data = createNode('');
			createLeaf('', ']', data);
			
			var result = Stringer.stringify(data);
			expect(result).toEqual('{(|)}\n(|])');
		});
	});
	describe('.prototype.stringify()', function() {
		it('finds a new name end delimiter when the current is used by the data', function() {
			var data = createNode('');
			createLeaf('', '|', data);
			
			var result = new Stringer(['{}', '[]'], ['|', '=']).stringify(data);
			expect(result).toEqual('{[=]}\n[=|]');
		});
		it('finds a new name end delimiter even when out of options', function() {
			var data = createNode('');
			createLeaf('', '|', data);
			
			var result = new Stringer(['{}', '[]'], ['|']).stringify(data);
			expect(result).toEqual('{[¡]}\n[¡|]');
		});
		it('finds new comment delimiters when the current is used by the data', function() {
			var data = createNode('');
			createLeaf('', '{', data);
			
			var result = new Stringer(['{}', '[]', '«»'], ['|']).stringify(data);
			expect(result).toEqual('[«|»]\n«|{»');
		});
		it('finds new tag delimiters when the current is used by the data', function() {
			var data = createNode('');
			createLeaf('', ']', data);
			
			var result = new Stringer(['{}', '[]', '«»'], ['|']).stringify(data);
			expect(result).toEqual('{«|»}\n«|]»');
		});
	});
});
