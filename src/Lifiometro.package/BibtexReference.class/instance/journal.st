accessing
journal
	^ (bibtexEntry at: 'journal') ifNil: [ '' ]