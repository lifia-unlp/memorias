rendering input
obtainDateValueFromString: aString
	| newDate |
	aString ifEmpty: [ ^ nil ].
	[ newDate := (DateParser
		readingFrom: aString readStream
		pattern: 'd/m/y') parse ]
		on: Error
		do: [ errors add: 'Debe ser una fecha valida en formato dd/mm/aaaa.'.
			^ nil ].
	^ newDate asDate