callbacks
fetch
	bibtexEntry := DoiToBibAPI new get: doi.
	bibtexEntry ifNil: [ ^ error := 'No encontré nada.' ].
