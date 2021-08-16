Class {
	#name : #ReferenceEditorComponent,
	#superclass : #TypedItemEditorComponent,
	#category : 'Lifiometro-Web'
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
