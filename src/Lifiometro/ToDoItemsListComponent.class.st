Class {
	#name : #ToDoItemsListComponent,
	#superclass : #TabbedListComponent,
	#category : #'Lifiometro-Web-Lists'
}

{ #category : #initialization }
ToDoItemsListComponent >> initializeGroupingAndFilteringAdapter [

	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		                               groupingBlock: [ :each | 'default' ]
		                               filteringBlock: [ :each :filter |
			                               each isCompleted
			                               & (filter = 'Completados')
			                               |
			                               (each isPending
			                                & (filter = 'Pendientes')) ]
		                               filters:
		                               { 'Pendientes'. 'Completados' }.
	groupingAndFilteringAdapter selectedFilter: 'Pendientes'
]

{ #category : #initialization }
ToDoItemsListComponent >> items [

	^ LifiometroRepository singleton toDoItems
]

{ #category : #'factory-methods' }
ToDoItemsListComponent >> newEditorFor: anEntry [

	^ ToDoEditorComponent item: anEntry
]

{ #category : #rendering }
ToDoItemsListComponent >> render: each on: html [

	| renderer |
	renderer := ReferenceRenderer new.
	html paragraph: [
		html paragraph: [
			html text: 'Item: '.
			each entry trashed
				ifTrue: [
					html text: '(eliminado) '.
					html tag: 's' with: [ renderer render: each entry on: html ] ]
				ifFalse: [ renderer render: each entry on: html ].
			html break.
			html text: 'Solicitud: ' , each request.
			html break.
			html text: 'Estado: ' , (each isCompleted
					 ifTrue: [ 'Completado' ]
					 ifFalse: [ 'Pendiente' ]) , ' - Fecha límite: '
				, each deadline ddmmyyyy.
			html break.
			html text: 'Solicitante: ' , each requestor fullName.
			html text: ' - Responsable: ' , each assignee fullName ] ]
]

{ #category : #initialization }
ToDoItemsListComponent >> renderActionsFor: each on: html [

	html anchor
		callback: [ self edit: each ];
		title: 'Editar esta entrada';
		with: [ html tbsGlyphIcon iconPencil ].

]

{ #category : #rendering }
ToDoItemsListComponent >> renderButtonsOn: html [

]

{ #category : #rendering }
ToDoItemsListComponent >> renderItemsOn: html [
		self
		renderItems: (groupingAndFilteringAdapter group: 'default')
		on: html
]

{ #category : #'rendering-hooks' }
ToDoItemsListComponent >> renderRelatedObjectsFor: each on: html [
]
