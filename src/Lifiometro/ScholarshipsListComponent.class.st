Class {
	#name : #ScholarshipsListComponent,
	#superclass : #TabbedListComponent,
	#category : #'Lifiometro-Web-Lists'
}

{ #category : #accessing }
ScholarshipsListComponent >> addScholarship [
	| result |
	result := self
		call:
			(ScholarshipEditorComponent new
				item: Scholarship new;
				yourself).
	result ifNotNil: [ self session save: result ]
]

{ #category : #initialization }
ScholarshipsListComponent >> initializeGroupingAndFilteringAdapter [
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | 'default' ]
		filteringBlock: [ :each :filter | 
			filter
				between: each startDate asDate year
				and: each endDate asDate year ]
		filters: (Date today year  + 1 to: Date today year - 5 by: -1).
	groupingAndFilteringAdapter selectedFilter: Date today year
]

{ #category : #accessing }
ScholarshipsListComponent >> items [
	^ LifiometroRepository singleton scholarships
		asSortedCollection: [ :a :b | a endDate asDate > b endDate asDate ]
]

{ #category : #'factory-methods' }
ScholarshipsListComponent >> newEditorFor: anEntry [

  ^ ScholarshipEditorComponent item: anEntry 
]

{ #category : #accessing }
ScholarshipsListComponent >> render: each on: html [
	html
		paragraph: [ html
				strong: 'Alumno: ' , each student;
				break.
			html
				text:
					'Fechas: ' , each startDate asDate printString , ' - '
						, each endDate asDate printString;
				break.
			html
				text: 'Título/tema: ' , each title;
				break.
			html
				text: 'Director(es): ' , each director;
				break.
			html
				text: 'Co-Director(es): ' , each coDirector;
				break.
			html
				text: 'Financiador: ' , each fundingAgency;
				break.
			html
				text: 'Tipo: ' , each type;
				break.
 ]
]

{ #category : #rendering }
ScholarshipsListComponent >> renderButtonsOn: html [
	html div
		style: 'padding-top:10px;padding-bottom:10px';
		with: [ html anchor
				callback: [ self addScholarship ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar' ] ]
]

{ #category : #accessing }
ScholarshipsListComponent >> renderItemsOn: html [
	self
		renderItems: (groupingAndFilteringAdapter group: 'default')
		on: html
]
