Class {
	#name : #InternalNewsRenderer,
	#superclass : #Object,
	#category : #'Lifiometro-Web'
}

{ #category : #rendering }
InternalNewsRenderer >> renderAsNews: anObject on: aCanvas [

	anObject renderAsNewsSubjectWith: self on: aCanvas
]

{ #category : #rendering }
InternalNewsRenderer >> renderBibtextReference: aBibtexReference on: html [

	html text: 'Referencia: ', aBibtexReference asSummary
]

{ #category : #rendering }
InternalNewsRenderer >> renderLifian: aLifian on: html [

	html text: 'Investigador: ' , aLifian fullName 
]

{ #category : #rendering }
InternalNewsRenderer >> renderLogEntry: aLogEntry on: aCanvas [

	aCanvas text: aLogEntry printString
]

{ #category : #rendering }
InternalNewsRenderer >> renderProject: aProject on: html [

	html text: 'Proyecto: ' , aProject title 
]

{ #category : #rendering }
InternalNewsRenderer >> renderRawReference: aRawReference on: html [

	html text: 'Referencia: ', aRawReference asSummary
]

{ #category : #rendering }
InternalNewsRenderer >> renderThesis: aThesis on: html [

	html text:
		'Tesis: ' , aThesis title , '" de ' , aThesis student
]
