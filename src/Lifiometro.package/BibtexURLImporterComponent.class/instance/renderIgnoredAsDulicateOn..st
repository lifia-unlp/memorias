rendering
renderIgnoredAsDulicateOn: html
	importer entriesIgnoredAsDuplicates ifEmpty: [ ^ self ].
	html heading
		level3;
		with:
			'Ignored as potential duplicates ('
				, importer entriesIgnoredAsDuplicates size printString , ')'.
	html
		paragraph:
			'For duplicates, only existing articles created from bibtex (not manually) were considered.'.
	importer entriesIgnoredAsDuplicates
		do:
			[ :each | html paragraph: (BibtexReference bibtexEntry: each) asSummary ]