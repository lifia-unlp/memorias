Class {
	#name : #WarningIgnoringLifiometroRepository,
	#superclass : #LifiometroRepository,
	#category : #'Lifiometro-Repository'
}

{ #category : #update }
WarningIgnoringLifiometroRepository >> remove: anObject onBehalfOf: aUser [

	[ super remove: anObject onBehalfOf: aUser ]
		on: Deprecation
		do: [ :dep | 
			Transcript
				show: dep messageText;
				cr ]
]

{ #category : #update }
WarningIgnoringLifiometroRepository >> save: anObject onBehalfOf: aUser [

	[ super save: anObject onBehalfOf: aUser ]
		on: Deprecation
		do: [ :dep | 
			Transcript
				show: dep messageText;
				cr ]
]
