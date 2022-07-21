Class {
	#name : #ReportComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #'as yet unclassified' }
ReportComponent >> buildJsonLDDictionary [
	^ self subclassResponsibility
]

{ #category : #rendering }
ReportComponent >> renderProject: project on: html [
	html
		paragraph: [
			self renderProjectTitle: project title on: html.
			html space.
			project fundingAgency
				ifNotEmpty: [ :it | html text: 'Financiado por ' , it , '. ' ].
			project director
				ifNotEmpty: [ :it | html text: 'Dirigido por ' , it , '. ' ].
			project coDirector
				ifNotEmpty: [ :it | html text: 'CoDirigido por ' , it , '. ' ].
			html
				text:
					'Duración: ' , project startDate ddmmyyyy , '-'
						, project endDate ddmmyyyy ]
]

{ #category : #rendering }
ReportComponent >> renderProjectTitle: aString on: html [
	^ self
]

{ #category : #accessing }
ReportComponent >> title [ 
	^ 'Memorias - LIFIA'
]

{ #category : #updating }
ReportComponent >> updateRoot: aWARoot [
	super updateRoot: aWARoot.
	aWARoot title: self title.
	aWARoot javascript
		type: 'application/json+ld';
		with:
			(JSStream
				on:
					(String
						streamContents: [ :stream | 
							(NeoJSONWriter on: stream)
								prettyPrint: true;
								nextPut: self buildJsonLDDictionary ]))
]
