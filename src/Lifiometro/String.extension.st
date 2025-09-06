Extension { #name : #String }

{ #category : #'*Lifiometro' }
String >> withoutLfCrAndExtraSpaces [

	^ self withBlanksCondensed withInternalLineEndings copyWithout:
		  Character cr
]
