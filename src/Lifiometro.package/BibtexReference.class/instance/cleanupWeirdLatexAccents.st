utility
cleanupWeirdLatexAccents
	self title: self title copyWithoutWeirdLatexAccents.
	(self bibtexEntry at: 'author')
		ifNotNil: [ self bibtexEntry
				at: 'author'
				put: (self bibtexEntry at: 'author') copyWithoutWeirdLatexAccents ].
	(self bibtexEntry at: 'editor')
		ifNotNil: [ self bibtexEntry
				at: 'editor'
				put: (self bibtexEntry at: 'editor') copyWithoutWeirdLatexAccents ]