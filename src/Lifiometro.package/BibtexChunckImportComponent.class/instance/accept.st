callbacks
accept
	bibtexEntry type = 'incollection' & newType isNil
		ifTrue: [ ^ error := 'Seleccione otro tipo en remplazo de incollection' ].
	newType notNil
		ifTrue: [ bibtexEntry type: newType ].
	self
		answer: (BibtexReference bibtexEntry: bibtexEntry) cleanupWeirdLatexAccents