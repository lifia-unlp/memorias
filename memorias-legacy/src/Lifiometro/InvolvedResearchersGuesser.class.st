Class {
	#name : #InvolvedResearchersGuesser,
	#superclass : #Object,
	#instVars : [
		'researchers',
		'guesses',
		'references'
	],
	#category : 'Lifiometro-Tools'
}

{ #category : #api }
InvolvedResearchersGuesser >> guess [
	guesses := Dictionary new. 
	references
		do: [ :each | 
			(self guessResearchersFor: each)
				ifNotEmpty: [ :it | guesses at: each put: it ] ]
]

{ #category : #api }
InvolvedResearchersGuesser >> guessResearchersFor: aReference [
	^ researchers
		inject: Set new
		into: [ :guess :each | 
			((self normalize: aReference asSummary)
				includesSubstring: (self normalize: each lastName))
				ifTrue: [ guess add: each ].
			guess ]
]

{ #category : #accessing }
InvolvedResearchersGuesser >> guesses [
	^ guesses
]

{ #category : #api }
InvolvedResearchersGuesser >> ignore: aReference [
	guesses removeKey: aReference
]

{ #category : #api }
InvolvedResearchersGuesser >> normalize: aString [
	| replacements |
	replacements := Dictionary new
		at: $á put: $a;
		at: $é put: $e;
		at: $í put: $i;
		at: $ó put: $o;
		at: $ú put: $u;
		yourself.
	^ String
		streamContents: [ :out | 
			aString asLowercase onlyLetters readStream
				do: [ :char | out nextPut: (replacements at: char ifAbsent: [ char ]) ] ]
]

{ #category : #initialization }
InvolvedResearchersGuesser >> researchers: aCollectionOfResearchers references: aCollectionOfReferences [
	researchers := aCollectionOfResearchers .
	references := aCollectionOfReferences.

]
