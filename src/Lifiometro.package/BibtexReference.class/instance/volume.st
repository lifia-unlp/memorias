accessing
volume
	^ (bibtexEntry at: 'volume') ifNil: [ '' ]