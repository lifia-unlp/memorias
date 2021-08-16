accessing
isOfUnkownType: aBibtexEntry
	^ aBibtexEntry type
		ifNil: [ true ]
		ifNotNil: [ ({'inproceedings' . 'inbook' . 'book' . 'article'}
				includes: aBibtexEntry type) not ]