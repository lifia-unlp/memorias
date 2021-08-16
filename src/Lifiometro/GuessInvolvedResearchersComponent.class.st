Class {
	#name : #GuessInvolvedResearchersComponent,
	#superclass : #WAComponent,
	#instVars : [
		'guesser',
		'updated'
	],
	#category : 'Lifiometro-Web'
}

{ #category : #rendering }
GuessInvolvedResearchersComponent >> edit: reference with: authors [
	| result |
	reference relatedLifians: authors.
	result := self call: (ReferenceEditorComponent item: reference).
	result ifNil: [ ^ self ].
	guesser ignore: result.
	self session save: result
]

{ #category : #initialization }
GuessInvolvedResearchersComponent >> guess [
	guesser := InvolvedResearchersGuesser new.
	guesser
		researchers: LifiometroRepository singleton lifians
		references: self referencesToGuess.
	guesser guess
]

{ #category : #initialization }
GuessInvolvedResearchersComponent >> initialize [
	super initialize.
	updated := Set new. 
	self guess. 
]

{ #category : #initialization }
GuessInvolvedResearchersComponent >> referencesToGuess [
	^ LifiometroRepository singleton references
		select: [ :each | each relatedLifians isEmptyOrNil ]
]

{ #category : #rendering }
GuessInvolvedResearchersComponent >> renderContentOn: html [
	html
		heading: 'Potenciales autorias (' , guesser guesses size greaseString , ')'.
	html
		paragraph: [ html anchor
				callback: [ self answer ];
				with: [ html button: 'Volver' ] ].
	html
		unorderedList: [ (guesser guesses keys
				asSortedCollection: [ :a :b | a year asNumber > b year asNumber ])
				do: [ :reference | 
					| authors |
					authors := guesser guesses at: reference.
					html
						listItem: [ html anchor
								callback: [ self setAuthors: authors for: reference ];
								with: 'accept'.
							html space.
							html anchor
								callback: [ guesser ignore: reference ];
								with: 'ignore'.
							html space.
							html anchor
								callback: [ self edit: reference with: authors ];
								with: 'edit'.
							html space.
							html text: reference asSummary ].
					html
						unorderedList: [ authors do: [ :researcher | html listItem: researcher fullName ] ] ] ]
]

{ #category : #rendering }
GuessInvolvedResearchersComponent >> setAuthors: authors for: reference [
	reference relatedLifians: authors.
	guesser ignore: reference. 
	self session save: reference
]
