rendering
renderIgnoredOfUnknownTypeOn: html
	| ignoredByType |
	importer entriesIgnoredAsUnkownTypes ifEmpty: [ ^ self ].
	html heading
		level3;
		with: 'Ignored as being of unknown types'.
	ignoredByType := (importer entriesIgnoredAsUnkownTypes collect: #type)
		asBag.
	ignoredByType asSet
		do: [ :each | 
			html
				text: each;
				text: ': ';
				text: (ignoredByType occurrencesOf: each) printString;
				break ]