accessing
fetchIgnoringDuplicatesIn: aCollectionOfReferences
	| candidateBibtexEntries |
	self ignore: aCollectionOfReferences.
	bibtexEntries := OrderedCollection new.
	entriesIgnoredAsUnkownTypes := OrderedCollection new.
	entriesIgnoredAsDuplicates := OrderedCollection new.
	DoiToBibAPI ensureBibtexMimeTypeIsNotBinary.
	[ candidateBibtexEntries := PPBibtexParser new
		parse: (ZnClient new get: url) copyWithoutWeirdLatexAccents ]
		on: Error
		do: [ :ex | 
			error := ex messageText.
			^ self ].
	(candidateBibtexEntries isNil or: [ candidateBibtexEntries isEmpty ])
		ifTrue: [ ^ self ].
	candidateBibtexEntries
		do: [ :each | 
			(self isOfUnkownType: each)
				ifTrue: [ entriesIgnoredAsUnkownTypes add: each ]
				ifFalse: [ (self seemsToBeADuplicate: each)
						ifTrue: [ entriesIgnoredAsDuplicates add: each ]
						ifFalse: [ bibtexEntries add: each ] ] ].
	years := (bibtexEntries collect: #year) asBag