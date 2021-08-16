rendering
items
	^ LifiometroRepository singleton references
		asSortedCollection: [ :a :b | a asSummary < b asSummary ]