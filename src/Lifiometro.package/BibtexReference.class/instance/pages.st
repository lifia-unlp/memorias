accessing
pages
	^ (bibtexEntry at: 'pages') ifNil: [ '' ]