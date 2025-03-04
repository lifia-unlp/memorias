Class {
	#name : #PublicThesisListComponent,
	#superclass : #SimpleListReportComponent,
	#instVars : [
		'undergraduateThesis',
		'specializationThesis',
		'masterThesis',
		'phdThesis'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #accessing }
PublicThesisListComponent class >> relativeUrl [
	^ 'thesis-list'
]

{ #category : #initialization }
PublicThesisListComponent >> completed [
	^ (self requestContext request at: 'completed') = 'true'
]

{ #category : #initialization }
PublicThesisListComponent >> prepareSections [
	| allThesis |
	allThesis := LifiometroRepository singleton thesis
		select: [ :each | 
			self completed
				ifTrue: [ each endDate notNil ]
				ifFalse: [ each endDate isNil ] ].
	self
		addSectionTitled: 'Doctorado'
		with:
			((allThesis select: [ :each | each level = 'PhD' ])
				asSortedCollection: [ :a :b | a startDate > b startDate ]).
	self
		addSectionTitled: 'Masters'
		with:
			((allThesis select: [ :each | each level = 'Masters' ])
				asSortedCollection: [ :a :b | a startDate > b startDate ]).
	self
		addSectionTitled: 'Especialización'
		with:
			((allThesis select: [ :each | each level = 'Specialization' ])
				asSortedCollection: [ :a :b | a startDate > b startDate ]).
	self
		addSectionTitled: 'Tesinas de grado'
		with:
			((allThesis select: [ :each | each level = 'Undergraduate' ])
				asSortedCollection: [ :a :b | a startDate > b startDate ])
]

{ #category : #initialization }
PublicThesisListComponent >> renderItem: item on: html [
	html
		paragraph: [ html strong: item title , '.'.
			html space.
			item career ifNotEmpty: [ :it | html text: '' , it , '.' ].
			html space.
			item student
				ifNotEmpty: [ :it | html text: 'Desarrollado por ' , it , '.' ].
			html space.
			item director
				ifNotEmpty: [ :it | html text: 'Dirigido por ' , it , '.' ].
			html space.
			item coDirector
				ifNotEmpty: [ :it | html text: 'CoDirigido por ' , it , '.' ].
			html space.
			html text: 'Iniciado el ' , item startDate ddmmyyyy , '.'.
			item endDate
				ifNotNil: [ :it | 
					html space.
					html text: 'Concluído el ' , it ddmmyyyy , '.' ].
			html space.
			html anchor
				url: '/' , (ThesisReportComponent relativeUrlFor: item);
				with: 'Ver Mas ...' ]
]

{ #category : #initialization }
PublicThesisListComponent >> reportTitle [
	^ 'Tesis, trabajos finales y tesinas '
		,
			(self completed
				ifFalse: [ 'en curso' ]
				ifTrue: [ 'concluídos' ])
]
