tools
checkConsistency
	LifiaUser selectAll collect: [ :each | each printString ].
	BibtexReference selectAll collect: [ :each | each lastEditedBy printString].

