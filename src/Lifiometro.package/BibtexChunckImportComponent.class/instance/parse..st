callbacks
parse: aBibtexString
   error := nil.
	bibtexEntry := PPBibtexParser new end parse: aBibtexString.
	bibtexEntry isPetitFailure
		ifTrue: [ error := 'No puedo obtener una entrada válida: ' , bibtexEntry message
				, ' at ' , bibtexEntry position printString.
			bibtexEntry := nil.
			^ self ].
	bibtexEntry isEmpty
		ifTrue: [ bibtexEntry := nil.
			error := 'No puero obtener una entrada válida.'.
			^ self ].
	bibtexEntry := bibtexEntry first