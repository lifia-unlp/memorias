Class {
	#name : #PublicationsListComponent,
	#superclass : #TabbedListComponent,
	#instVars : [
		'referenceRenderer'
	],
	#category : #'Lifiometro-Web-Lists'
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

{ #category : #initialization }
PublicationsListComponent >> initializeGroupingAndFilteringAdapter [

	referenceRenderer := ReferenceRenderer new.
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		                               groupingBlock: [ :each | each type ]
		                               filteringBlock: [ :each :filter |
		                               each year = filter ]
		                               filters:
			                               ((Date today year + 1 to:
			                                 Date today year - 5 by: -1)
				                                collect: #printString).
	groupingAndFilteringAdapter selectedFilter:
		Date today year printString
]

{ #category : #rendering }
PublicationsListComponent >> items [
	^ LifiometroRepository singleton references
		asSortedCollection: [ :a :b | a asSummary < b asSummary ]
]

{ #category : #'factory-methods' }
PublicationsListComponent >> newEditorFor: anEntry [

	^ ReferenceEditorComponent item: anEntry
]

{ #category : #rendering }
PublicationsListComponent >> render: each on: html [

	referenceRenderer render: each on: html.
	html
		break;
		break
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
	self
		renderItems: (groupingAndFilteringAdapter group: 'book')
		on: html.

	html heading
		level: 4;
		with: 'Otros (misc)'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'misc')
		on: html
]
