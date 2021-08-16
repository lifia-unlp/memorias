accessing
publisher
	^ (bibtexEntry at: 'publisher') ifNil: [ '' ]