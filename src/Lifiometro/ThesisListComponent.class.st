Class {
	#name : #ThesisListComponent,
	#superclass : #TabbedListComponent,
	#category : 'Lifiometro-Web'
}

{ #category : #adding }
ThesisListComponent >> addThesis [
	| result |
	result := self
		call:
			(ThesisEditorComponent new
				item: Thesis new;
				yourself).
	result ifNotNil: [ self session save: result ]
]

{ #category : #rendering }
ThesisListComponent >> edit: each [
	| result |
	result := self call: (ThesisEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result
]

{ #category : #initialization }
ThesisListComponent >> initializeGroupingAndFilteringAdapter [
	| end |
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | each level ]
		filteringBlock: [ :each :filter | 
			end := each endDate
				ifNil: [ '1/1/2050' asDate ]
				ifNotNil: [ :it | it ].
			filter between: each startDate asDate year and: end year ]
		filters: (Date today year + 1 to: Date today year - 5 by: -1).
	groupingAndFilteringAdapter selectedFilter: Date today year
]

{ #category : #adding }
ThesisListComponent >> items [
	^ LifiometroRepository singleton  thesis
		asSortedCollection: [ :a :b | a startDate asDate > b startDate asDate ]
]

{ #category : #adding }
ThesisListComponent >> render: each on: html [
	| endDate |
	endDate := each endDate
		ifNil: [ '' ]
		ifNotNil: [ :it | each endDate asDate printString ].
	html
		paragraph: [ html
				strong: 'Alumno(s): ' , each student;
				break.
			html
				text: 'Fechas: ' , each startDate asDate printString , ' - ' , endDate;
				break.
			html
				text: 'Título: ' , each title;
				break.
			html
				text: 'Director(es): ' , each director;
				break.
			html
				text: 'Co-Director(es): ' , each coDirector;
				break.
			html
				text: 'Carrera: ' , each career;
				break.
			html
				text: 'Resumen: ' , each summary;
				break ]
]

{ #category : #rendering }
ThesisListComponent >> renderButtonsOn: html [
	html div
		style: 'padding-top:10px;padding-bottom:10px';
		with: [ html anchor
				callback: [ self addThesis ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar' ] ]
]

{ #category : #rendering }
ThesisListComponent >> renderItemsOn: html [
	html heading
		level: 4;
		with: 'Estudiantes doctorales'.
	self renderItems: (groupingAndFilteringAdapter group: 'PhD') on: html.

	html heading
		level: 4;
		with: 'Estudiantes de maestría (tesis)'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'Masters')
		on: html.

	html heading
		level: 4;
		with: 'Estudiantes de especialización (trabajo final)'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'Specialization')
		on: html.

	html heading
		level: 4;
		with: 'Estudiantes de grado (tesina)'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'Undergraduate')
		on: html
]
