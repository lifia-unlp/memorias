Class {
	#name : #DuplicateSpotter,
	#superclass : #WAComponent,
	#instVars : [
		'referenceDuplicates',
		'thesisDuplicated',
		'scholarshipDuplicates',
		'lifianDuplicates',
		'projectDuplicates'
	],
	#category : #'Lifiometro-Web-Admin'
}

{ #category : #rendering }
DuplicateSpotter >> initialize [

	super initialize.
	referenceDuplicates := OrderedCollection new.
	thesisDuplicated := OrderedCollection new.
	scholarshipDuplicates := OrderedCollection new.
	lifianDuplicates := OrderedCollection new.
	projectDuplicates := OrderedCollection new
]

{ #category : #rendering }
DuplicateSpotter >> renderContentOn: html [

	html tbsPanel: [
		html tbsPanelBody: [ self renderReferenceDuplicatesOn: html.
			self renderProjectDuplicatesOn: html.
			self renderThesisDuplicatesOn: html.
			self renderScholarshipDuplicatesOn: html.
			self renderLifianDuplicatesOn: html ] ]
]

{ #category : #rendering }
DuplicateSpotter >> renderLifianDuplicatesOn: html [

	html heading: 'Participantes potencialmente duplicados'.
	html anchor
		callback: [ self updateLifianDuplicates ];
		with: '[Actualizar]'.
	html unorderedList: [
		lifianDuplicates do: [ :each | html listItem: each asSummary ] ]
]

{ #category : #rendering }
DuplicateSpotter >> renderProjectDuplicatesOn: html [

	html heading: 'Proyectos potencialmente duplicados'.
	html anchor
		callback: [ self updateProjectDuplicates ];
		with: '[Actualizar]'.
	html unorderedList: [
		projectDuplicates do: [ :each |
			html listItem: [
				html text: (String streamContents: [ :s |
						 s
							 nextPutAll: each title;
							 nextPutAll: ' (';
							 nextPutAll: each startDate ddmmyyyy;
							 nextPutAll: '-';
							 nextPutAll: each endDate ddmmyyyy;
							 nextPutAll: ')' ]) ] ] ]
]

{ #category : #rendering }
DuplicateSpotter >> renderReferenceDuplicatesOn: html [

	html heading: 'Referencias potencialmente duplicadas'.
	html anchor
		callback: [ self updateReferenceDuplicates ];
		with: '[Actualizar]'.
	html unorderedList: [
		referenceDuplicates do: [ :each | html listItem: each asSummary ] ]
]

{ #category : #rendering }
DuplicateSpotter >> renderScholarshipDuplicatesOn: html [

	html heading: 'Becas potencialmente duplicadas'.
	html anchor
		callback: [ self updateScholarshipDuplicates ];
		with: '[Actualizar]'.
	html unorderedList: [
		scholarshipDuplicates do: [ :each |
			html listItem: [
				html text: (String streamContents: [ :s |
						 s
							 nextPutAll: each student;
							 nextPutAll: ' (';
							 nextPutAll: each startDate ddmmyyyy;
							 nextPutAll: '-';
							 nextPutAll: each endDate ddmmyyyy;
							 nextPutAll: ')' ]) ] ] ]
]

{ #category : #rendering }
DuplicateSpotter >> renderThesisDuplicatesOn: html [

	html heading: 'Tesis potencialmente duplicadas'.
	html anchor
		callback: [ self updateThesisDuplicates ];
		with: '[Actualizar]'.
	html unorderedList: [
		thesisDuplicated do: [ :each |
			html listItem: [
				html text: (String streamContents: [ :s |
						 s
							 nextPutAll: each title;
							 nextPutAll: ' (';
							 nextPutAll: each student;
							 nextPutAll: ')' ]) ] ] ]
]

{ #category : #update }
DuplicateSpotter >> updateProjectDuplicates [

	| finder |
	finder := DuplicateFinder new.
	projectDuplicates   := finder findPotentialProjectDuplicatesIn:
		                       LifiometroRepository singleton projects.
	projectDuplicates := projectDuplicates asSortedCollection: [ :a :b |
		                       a startDate > b startDate
		                       | (a startDate > b startDate & (a title <= b title)) ] 
]

{ #category : #update }
DuplicateSpotter >> updateReferenceDuplicates [

	| finder |
	finder := DuplicateFinder new.
	referenceDuplicates := finder findPotentialReferenceDuplicatesIn:
		                       LifiometroRepository singleton references.
	referenceDuplicates := referenceDuplicates asSortedCollection: [ :a :b |
		                       a year > b year
		                       | (a year = b year & (a author <= b author)) ]
]

{ #category : #update }
DuplicateSpotter >> updateScholarshipDuplicates [

	| finder |
	finder := DuplicateFinder new.
	scholarshipDuplicates  := finder findPotentialScholarshipDuplicatesIn:
		                       LifiometroRepository singleton scholarships.
	scholarshipDuplicates := scholarshipDuplicates asSortedCollection: [ :a :b |
		                       a startDate > b startDate
		                       | (a startDate > b startDate & (a student <= b student)) ] 
]

{ #category : #update }
DuplicateSpotter >> updateThesisDuplicates [

	| finder |
	finder := DuplicateFinder new.
	thesisDuplicated := finder findPotentialThesisDuplicatesIn:
		                    LifiometroRepository singleton thesis.
	thesisDuplicated := thesisDuplicated asSortedCollection: [ :a :b |
		                    a title <= b title ]
]
