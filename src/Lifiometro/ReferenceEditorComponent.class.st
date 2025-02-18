Class {
	#name : #ReferenceEditorComponent,
	#superclass : #TypedItemEditorComponent,
	#category : #'Lifiometro-Web-Editors'
}

{ #category : #utility }
ReferenceEditorComponent >> accept [
	newType isEmptyOrNil
		ifTrue: [ errors add: 'Debe especificar el tipo' ].
	(newValues at: 'year' ifAbsentPut: '')
		ifEmpty: [ errors add: 'Debe especificar el año' ].
	[((newValues at: 'year') asNumber)] on: Error do: [ errors add: 'Año debe ser un numero válido en formato de 4 dígitos' ].
	item class = BibtexReference
		ifTrue: [ (newValues at: 'title' ifAbsentPut: '')
				ifEmpty: [ errors add: 'Debe especificar un título' ] ].
	item class = RawReference 
		ifTrue: [ (newValues at: 'reference' ifAbsentPut: '')
				ifEmpty: [ errors add: 'Debe especificar una referencia en formato ACM' ] ].
	errors ifNotEmpty: [ ^ self ].
	super accept
]

{ #category : #'as yet unclassified' }
ReferenceEditorComponent >> allowedArticleRankings [

	^ { 'Q1'. 'Q2'. 'Q3'. 'Q4'.  'A'. 'B'. 'C'. 'N/A'  }
]

{ #category : #utility }
ReferenceEditorComponent >> allowedTypes [
	^ Dictionary new
		at: 'inproceedings' put: 'Conference article';
		at: 'article' put: 'Journal article';
		at: 'book' put: 'Book';
		at: 'inbook' put: 'Book part';
		at: 'misc' put: 'Other';
		yourself
]

{ #category : #utility }
ReferenceEditorComponent >> renderDateInputEditorFor: property on: html [
	"en caso de que tenga una propiedad date en el bibtex"

	self renderTextInputEditorFor: property on: html
]

{ #category : #utility }
ReferenceEditorComponent >> renderInputEditorFor: each on: html [

	each = 'ranking'
		ifFalse: [ super renderInputEditorFor: each on: html ]
		ifTrue: [ self renderPublicationRankingDropdownEditorOn: html ]
]

{ #category : #'as yet unclassified' }
ReferenceEditorComponent >> renderPublicationRankingDropdownEditorOn: html [

	| currentRanking |
	currentRanking := newValues at: 'ranking'.
	currentRanking ifNil: [ currentRanking := 'N/A' ].
	currentRanking ifEmpty: [ currentRanking := 'N/A' ].
	html tbsFormGroup: [
		html label
			for: 'ranking';
			with: 'Ranking'.
		html break.
		self
			renderEditorInstructions:
			'For journals use Q1 to Q4 according to Scimago. For conferences use A, B, C according to CORE'
			on: html.
		html break.
		html select
			callback: [ :value |
				value = 'N/A'
					ifTrue: [ newValues at: 'ranking' put: nil ]
					ifFalse: [ newValues at: 'ranking' put: value ] ];
			list: self allowedArticleRankings;
			selected: currentRanking ]
]

{ #category : #'as yet unclassified' }
ReferenceEditorComponent >> renderPublicationRankingEditorOn: html [

	| currentRanking |
	currentRanking := newValues at: 'ranking'.
	currentRanking ifNil: [ currentRanking := 'N/A' ].
	currentRanking ifEmpty: [ currentRanking := 'N/A' ].
	html tbsFormGroup: [
		html label
			for: 'ranking';
			with: 'Ranking'.
		html break.
		html radioGroup
			callback: [ :value |
				value = 'N/A'
					ifTrue: [ newValues at: 'ranking' put: nil ]
					ifFalse: [ newValues at: 'ranking' put: value ] ];
			selected: currentRanking;
			with: [ :group |
				self allowedArticleRankings do: [ :each |
						group radioButton value: each.
						html
							space;
							text: each;
							break ] ] ]
]
