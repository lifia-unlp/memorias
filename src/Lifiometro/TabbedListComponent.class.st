Class {
	#name : #TabbedListComponent,
	#superclass : #WAComponent,
	#instVars : [
		'groupingAndFilteringAdapter',
		'plainView',
		'filteringTabsComponent',
		'parent'
	],
	#category : #'Lifiometro-Web'
}

{ #category : #callbacks }
TabbedListComponent >> addToDoFor: anEntry [

	| result |
	result := self call: (ToDoEditorComponent new
			           item: (ToDoItem new
					            entry: anEntry;
					            yourself);
			           yourself).
	result ifNotNil: [ self session save: result ]
]

{ #category : #initialization }
TabbedListComponent >> children [
	^ {filteringTabsComponent}
]

{ #category : #callbacks }
TabbedListComponent >> confirmDeletionOf: each [

	^ self call: (DeletionConfirmer new
			   entry: each;
			   yourself)
]

{ #category : #initialization }
TabbedListComponent >> initialize [
	super initialize.
	plainView := false.
	self initializeGroupingAndFilteringAdapter.
	filteringTabsComponent := FilteringTabsComponent
		on: groupingAndFilteringAdapter
]

{ #category : #initialization }
TabbedListComponent >> initializeGroupingAndFilteringAdapter [
	^ self subclassResponsibility
]

{ #category : #accessing }
TabbedListComponent >> items [
	^ self subclassResponsibility
]

{ #category : #callbacks }
TabbedListComponent >> openPlainView [
	self
		show:
			(self class new
				plainView: true;
				yourself)
]

{ #category : #accessing }
TabbedListComponent >> parent: anObject [
	parent := anObject
]

{ #category : #accessing }
TabbedListComponent >> plainView: anObject [
	plainView := anObject
]

{ #category : #callbacks }
TabbedListComponent >> remove: each [

	(self confirmDeletionOf: each) ifFalse: [ ^ self ].
	self session remove: each
]

{ #category : #rendering }
TabbedListComponent >> render: each on: html [
	self subclassResponsibility
]

{ #category : #rendering }
TabbedListComponent >> renderActionsFor: each on: html [

	html anchor
		callback: [ self edit: each ];
		title: 'Editar esta entrada';
		with: [ html tbsGlyphIcon iconPencil ].
	html space.
	html anchor
		callback: [ self addToDoFor: each ];
		title: 'Solicitar cambios';
		with: [ html tbsGlyphIcon iconComment ].
	html space.
	html space.
	html anchor
		callback: [ self remove: each ];
		title: 'Archivar esta entrada';
		with: [
			html tbsGlyphIcon
				iconTrash;
				style: 'color: red;' ]
]

{ #category : #rendering }
TabbedListComponent >> renderButtonsOn: html [
	self subclassResponsibility
]

{ #category : #rendering }
TabbedListComponent >> renderContentOn: html [
	groupingAndFilteringAdapter list: self items.
	html tbsPanel
		with: [ html
				tbsPanelBody: [ html render: filteringTabsComponent.
					plainView
						ifFalse: [ self renderButtonsOn: html ].
					self renderItemsOn: html ] ]
]

{ #category : #rendering }
TabbedListComponent >> renderItems: items on: html [
	html
		tbsTable: [ html
				tableBody: [ items
						do: [ :each | 
							each trashed
								ifFalse: [ html
										tableRow: [ html
												tableData: [ self render: each on: html.
													html
														paragraph: [ self renderRelatedLifiansFor: each on: html.
															self renderRelatedProjectsFor: each on: html ].
													plainView
														ifFalse: [ self renderActionsFor: each on: html ] ] ] ] ] ] ]
]

{ #category : #rendering }
TabbedListComponent >> renderItemsOn: html [
	self subclassResponsibility
]

{ #category : #rendering }
TabbedListComponent >> renderRelatedLifiansFor: each on: html [
	html
		text:
			'Investigadores: '
				,
					((each relatedLifians ifNil: [ Set new ])
						collect: [ :lifian | lifian fullName ]) asCommaString.
]

{ #category : #rendering }
TabbedListComponent >> renderRelatedProjectsFor: each on: html [
	html break.
	html
		text:
			'Proyectos: '
				,
					((each relatedProjects ifNil: [ Set new ])
						collect: [ :project | project title ]) asCommaString
]

{ #category : #rendering }
TabbedListComponent >> renderSelfArchivingUrlFor: each on: html [
	each selfArchivingUrl ifNil: [ ^ self ].
	each selfArchivingUrl ifEmpty: [ ^ self ].
	html space.
	html anchor
		url: each selfArchivingUrl;
		target: '_blank';
		with: '(PDF)'.
	html space
]
