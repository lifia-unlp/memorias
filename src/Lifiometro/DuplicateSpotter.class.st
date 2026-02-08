Class {
	#name : #DuplicateSpotter,
	#superclass : #WAComponent,
	#instVars : [
		'referenceDuplicates'
	],
	#category : #'Lifiometro-Web-Admin'
}

{ #category : #rendering }
DuplicateSpotter >> renderContentOn: html [

	html tbsPanel: [
		html tbsPanelBody: [ self renderReferenceDuplicatesOn: html ] ]
]

{ #category : #rendering }
DuplicateSpotter >> renderReferenceDuplicatesOn: html [

	html heading: 'Referencias potencialmente duplicadas'.
	referenceDuplicates ifNil: [ self updateReferenceDuplicates ].
	referenceDuplicates := referenceDuplicates asSortedCollection: [ :a :b |
		                       a year > b year
		                       |
		                       (a year = b year & (a author <= b author)) ].
	html anchor
		callback: [ self updateReferenceDuplicates ];
		with: '[Actualizar]'.
	html unorderedList: [
		referenceDuplicates do: [ :each | html listItem: each asSummary ] ]
]

{ #category : #rendering }
DuplicateSpotter >> updateReferenceDuplicates [

	| finder |
	finder := DuplicateFinder new.
	referenceDuplicates := finder findPotentialReferenceDuplicatesIn:
		                       LifiometroRepository singleton references.

]
