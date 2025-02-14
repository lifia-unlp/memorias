Class {
	#name : #ProjectsListComponent,
	#superclass : #TabbedListComponent,
	#category : #'Lifiometro-Web-Lists'
}

{ #category : #rendering }
ProjectsListComponent >> addProject [
	| result |
	result := self
		call:
			(ProjectEditorComponent  new
				item: Project new;
				yourself).
	result ifNotNil: [ self session save: result ]
]

{ #category : #initialization }
ProjectsListComponent >> initializeGroupingAndFilteringAdapter [
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | 'default' ]
		filteringBlock: [ :each :filter | 
			filter
				between: each startDate asDate year
				and: each endDate asDate year ]
		filters: (Date today year + 1 to: Date today year - 5 by: -1).
	groupingAndFilteringAdapter selectedFilter: Date today year
]

{ #category : #accessing }
ProjectsListComponent >> items [
	^ LifiometroRepository singleton projects
		asSortedCollection: [ :a :b | a endDate asDate > b endDate asDate ]
]

{ #category : #'factory-methods' }
ProjectsListComponent >> newEditorFor: anEntry [

  ^ProjectEditorComponent item: anEntry 
]

{ #category : #rendering }
ProjectsListComponent >> render: each on: html [
	html
		paragraph: [ html
				strong: each title;
				break.
			html
				text: 'Código: ' , each code;
				break.
			html
				text:
					'Fechas: ' , each startDate asDate printString , ' - '
						, each endDate asDate printString;
				break.
			html
				text: 'Director(es): ' , each director;
				break.
			html
				text: 'Co-Director(es): ' , each coDirector;
				break.
			html
				text: 'Grupo responsable: ' , each responsibleGroup;
				break.
			html
				text: 'Financiador: ' , each fundingAgency;
				break.
			html
				text: 'Monto: ' , each amount;
				break.
			html text: 'Resumen: ' , each summary ]
]

{ #category : #rendering }
ProjectsListComponent >> renderButtonsOn: html [
	html div
		style: 'padding-top:10px;padding-bottom:10px';
		with: [ html anchor
				callback: [ self addProject ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar' ] ]
]

{ #category : #rendering }
ProjectsListComponent >> renderItemsOn: html [
	self
		renderItems: (groupingAndFilteringAdapter group: 'default')
		on: html
]

{ #category : #rendering }
ProjectsListComponent >> renderRelatedProjectsFor: each on: html [
	^ self
]
