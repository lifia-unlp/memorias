Extension { #name : #String }

{ #category : #'*Lifiometro' }
String >> copyWithoutLatexAccentsAndBraces [
	| replacements newString |
	newString := self.
	replacements := Dictionary new.
	replacements
		at: '{\''{a}}' put: 'á';
		at: '{\''{e}}' put: 'é';
		at: '{\''{i}}' put: 'í';
		at: '{\''{o}}' put: 'ó';
		at: '{\''{\i}}' put: 'i';
		at: '{\''{u}}' put: 'ú';
		at: 'l{\"{o}}' put: 'ö';
		at: 'l{\"{u}}' put: 'ü';
		at: '{' put: '';
		at: '}' put: ''.
	replacements
		associationsDo:
			[ :ass | newString := newString copyReplaceAll: ass key with: ass value ].
	^ newString
]
