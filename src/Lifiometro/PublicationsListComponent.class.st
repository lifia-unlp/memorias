Class {
	#name : #PublicationsListComponent,
	#superclass : #TabbedListComponent,
	#category : #'Lifiometro-Web'
}

{ #category : #callbacks }
PublicationsListComponent >> addPublicationFromBibtex [
	| cite |
	cite := self call: BibtexChunckImportComponent new.
	cite ifNotNil: [ self session save: cite ]
]

{ #category : #callbacks }
PublicationsListComponent >> addPublicationFromDoi [
	| cite |
	cite := self call: DoiImportComponent new.
	cite ifNotNil: [ self session save: cite ]
]

{ #category : #callbacks }
PublicationsListComponent >> addPublicationFromRawCite [
	| cite editor |
	editor := ReferenceEditorComponent new.
	editor item: RawReference new.
	cite := self call: editor.
	cite ifNotNil: [ self session save: cite ]
]

{ #category : #callbacks }
PublicationsListComponent >> edit: each [
	| result |
	result := self call: (ReferenceEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result
]

{ #category : #initialization }
PublicationsListComponent >> initializeGroupingAndFilteringAdapter [
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | each type ]
		filteringBlock: [ :each :filter | each year = filter ]
		filters:
			((Date today year + 1 to: Date today year - 5 by: -1)
				collect: #printString).
	groupingAndFilteringAdapter
		selectedFilter: Date today year printString
]

{ #category : #rendering }
PublicationsListComponent >> items [
	^ LifiometroRepository singleton references
		asSortedCollection: [ :a :b | a asSummary < b asSummary ]
]

{ #category : #rendering }
PublicationsListComponent >> render: each on: html [
	html paragraph: each asSummary
]

{ #category : #rendering }
PublicationsListComponent >> renderActionsFor: each on: html [
	self renderSelfArchivingUrlFor: each on: html.
	super renderActionsFor: each on: html.
	each class = BibtexReference
		ifTrue: [ html space.
			html tbsGlyphIcon iconCheck ].

]

{ #category : #rendering }
PublicationsListComponent >> renderButtonsOn: html [
	html div
		style: 'padding-top:10px;padding-bottom:10px';
		with: [ html anchor
				callback: [ self addPublicationFromDoi ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar con DOI' ].
			html space.
			html anchor
				callback: [ self addPublicationFromBibtex ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar de bibtex' ].
			html space.
			html anchor
				callback: [ self addPublicationFromRawCite ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar a mano' ] ]
]

{ #category : #rendering }
PublicationsListComponent >> renderItemsOn: html [
	html heading
		level: 4;
		with: 'Artículos en revistas'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'article')
		on: html.
	html heading
		level: 4;
		with: 'Artículos en conferencias'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'inproceedings')
		on: html.
	html heading
		level: 4;
		with: 'Capítulos de libros'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'inbook')
		on: html.
	html heading
		level: 4;
		with: 'Libros'.
	^ self
		renderItems: (groupingAndFilteringAdapter group: 'book')
		on: html
]
