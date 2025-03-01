Class {
	#name : #ReferenceEditorComponent,
	#superclass : #PluggableEditorComponent,
	#instVars : [
		'newType'
	],
	#category : #'Lifiometro-Web-Editors'
}

{ #category : #callbacks }
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
	item type: newType.
	super accept
]

{ #category : #defaults }
ReferenceEditorComponent >> allowedArticleRankings [

	^ { 'Q1'. 'Q2'. 'Q3'. 'Q4'.  'A'. 'B'. 'C'. 'N/A'  }
]

{ #category : #defaults }
ReferenceEditorComponent >> allowedTypes [
	^ Dictionary new
		at: 'inproceedings' put: 'Articulo de conferencia';
		at: 'article' put: 'Artículo de revista';
		at: 'book' put: 'Libro';
		at: 'inbook' put: 'Capítulo de libro';
		at: 'techreport' put: 'Reporte técnico';
		at: 'phdthesis' put: 'Tesis de doctorado';
		at: 'mastersthesis' put: 'Tesis de maestría';
		at: 'misc' put: 'Otro';
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

{ #category : #rendering }
ReferenceEditorComponent >> renderPropertyEditorsOn: html [
	| props |
	props := item propertyNames asOrderedCollection.
	(props includes: 'title')
		ifTrue: [ self renderInputEditorFor: 'title' on: html.
			props remove: 'title' ].
	self renderTypeEditorOn: html.
	props remove: 'type' ifAbsent: [  ].
	props do: [ :each | self renderInputEditorFor: each on: html ].
]

{ #category : #rendering }
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

{ #category : #rendering }
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

{ #category : #rendering }
ReferenceEditorComponent >> renderTypeEditorLabeled: label instructions: instructions on: html [
	html
		tbsFormGroup: [ html label
				for: 'type';
				with: (label ifNil: [ 'Type' ]).
			html break.
			html radioGroup
				callback: [ :value | newType := value ];
				selected: item type;
				with: [ :group | 
					(self allowedTypes associations
						asSortedCollection: [ :a :b | a value < b value ])
						do: [ :each | 
							group radioButton value: each key.
							html
								space;
								text: (self allowedTypes at: each key) , ' (' , each key , ')';
								break ] ] ]
]

{ #category : #rendering }
ReferenceEditorComponent >> renderTypeEditorOn: html [
	self renderTypeEditorLabeled: 'Type' instructions: nil on: html
]
