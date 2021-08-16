testing
checkForErrors
	| year |
	bibtexEntry ifNil: [ ^ self ].
	self canImport
		ifFalse: [ error := 'No es posible importar referencias del tipo '
				, bibtexEntry type ].
	[ year := bibtexEntry year asNumber ]
		on: Error
		do: [ year := nil ].
	year
		ifNil:
			[ error := 'El registro debe incluir la propiedad ''year'' con un valor válido en formato de 4 dígitos ' ]