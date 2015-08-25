function describeStringerTests(): void {
	describe('pml.Stringer', function() {
		describe('.stringify()', function() {
			it('should stringify pml', function() {
				
				var data = createNode('');
				createLeaf('Árvíztűrő tükörfúrógép', 'Flood-resistant mirror drill', data);
				createLeaf('', '', data);
				var root = createNode('root', data);
				createLeaf('leaf-1', 'A', root);
				var leaf2 = createNode('leaf-2', root);
				createLeaf('', 'B', leaf2);
				createLeaf('', 'b', leaf2);
				createLeaf('leaf-3', 'C', root);
				
				var result = pml.Stringer.stringify(data);
				
				expect(result).to.equal(`{[|]}
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
			it('should find a new name end delimiter when the current is used by the data', function() {
				var data = createNode('');
				createLeaf('', '|', data);
				
				var result = pml.Stringer.stringify(data);
				expect(result).to.equal('{[\\]}\n[\\|]');
			});
			it('should find new comment delimiters when the current is used by the data', function() {
				var data = createNode('');
				createLeaf('', '{', data);
				
				var result = pml.Stringer.stringify(data);
				expect(result).to.equal('[(|)]\n(|{)');
			});
			it('should find new tag delimiters when the current is used by the data', function() {
				var data = createNode('');
				createLeaf('', ']', data);
				
				var result = pml.Stringer.stringify(data);
				expect(result).to.equal('{(|)}\n(|])');
			});
		});
		describe('.prototype.stringify()', function() {
			it('should find a new name end delimiter when the current is used by the data', function() {
				var data = createNode('');
				createLeaf('', '|', data);
				
				var result = new pml.Stringer(['{}', '[]'], ['|', '=']).stringify(data);
				expect(result).to.equal('{[=]}\n[=|]');
			});
			it('should find a new name end delimiter even when out of options', function() {
				var data = createNode('');
				createLeaf('', '|', data);
				
				var result = new pml.Stringer(['{}', '[]'], ['|']).stringify(data);
				expect(result).to.equal('{[¡]}\n[¡|]');
			});
			it('should find new comment delimiters when the current is used by the data', function() {
				var data = createNode('');
				createLeaf('', '{', data);
				
				var result = new pml.Stringer(['{}', '[]', '«»'], ['|']).stringify(data);
				expect(result).to.equal('[«|»]\n«|{»');
			});
			it('should find new tag delimiters when the current is used by the data', function() {
				var data = createNode('');
				createLeaf('', ']', data);
				
				var result = new pml.Stringer(['{}', '[]', '«»'], ['|']).stringify(data);
				expect(result).to.equal('{«|»}\n«|]»');
			});
		});
	});
}