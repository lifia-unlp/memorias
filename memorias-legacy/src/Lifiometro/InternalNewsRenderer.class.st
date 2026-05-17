Class {
	#name : #InternalNewsRenderer,
	#superclass : #Object,
	#category : #'Lifiometro-Web-Renderers'
}

{ #category : #rendering }
InternalNewsRenderer >> renderAsNews: anObject on: aCanvas [

	anObject renderAsNewsSubjectWith: self on: aCanvas
]

{ #category : #rendering }
InternalNewsRenderer >> renderBibtextReference: aBibtexReference on: html [

	html text: '(Articulo) ', aBibtexReference asSummary
]

{ #category : #rendering }
InternalNewsRenderer >> renderLifian: aLifian on: html [

	html text: '(Investigador) ' , aLifian fullName 
]

{ #category : #rendering }
InternalNewsRenderer >> renderLogEntry: aLogEntry on: aCanvas [

	aCanvas text: aLogEntry printString
]

{ #category : #rendering }
InternalNewsRenderer >> renderProject: aProject on: html [

	html text: '(Proyecto) ' , aProject title 
]

{ #category : #rendering }
InternalNewsRenderer >> renderRawReference: aRawReference on: html [

	html text: '(Articulo) ', aRawReference asSummary
]

{ #category : #rendering }
InternalNewsRenderer >> renderScholarship: aScholarship on: html [

	html text:
		'(Beca) ' , aScholarship type , ' de ' , aScholarship student
		, ' dirigida por ' , aScholarship director
]

{ #category : #rendering }
InternalNewsRenderer >> renderThesis: aThesis on: html [

	html text:
		'(Tesis) ' , aThesis title , '" de ' , aThesis student
]

{ #category : #rendering }
InternalNewsRenderer >> renderToDoItem: aToDoItem on: aCanvas [

	aCanvas text:
		'Solicitud de ' , aToDoItem requestor fullName , ' para '
		, aToDoItem assignee fullName , ': ' , aToDoItem request
]
