Class {
	#name : #PublicationsListComponent,
	#superclass : #TabbedListComponent,
	#instVars : [
		'referenceRenderer'
	],
	#category : #'Lifiometro-Web-Lists'
}

{ #category : #callbacks }
PublicationsListComponent >> addEmpty: aType [

	| reference editor bibtexEntry |
	bibtexEntry := BibtexEntry empty: aType.
	editor := ReferenceEditorComponent new.
	editor item: (BibtexReference bibtexEntry: bibtexEntry).
	reference := self call: editor.
	reference ifNotNil: [ self session save: reference ]
]

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
		                               groupingBlock: [ :each |
			                               ({ 'article'. 'inproceedings'.
			                                'inbook'. 'book' } includes:
				                                each type)
				                               ifTrue: [ each type ]
				                               ifFalse: [ 'other' ] ]
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

	^ LifiometroRepository singleton references asSortedCollection: [ :a :b |
		  a year > b year or: [
			  a year = b year and: [ a asSummary < b asSummary ] ] ]
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
		with: [
			| addWithFormMenu addAutomaticallyMenu |
			addWithFormMenu := [
			                   html tbsDropdownMenuItem: [
					                   html anchor
						                   callback: [ self addEmpty: 'article' ];
						                   with: 'Artículo de revista' ].
			                   html tbsDropdownMenuItem: [
				                   html anchor
					                   callback: [ self addEmpty: 'inproceedings' ];
					                   with: 'Artículo de conferencia' ].
			                   html tbsDropdownMenuItem: [
				                   html anchor
					                   callback: [ self addEmpty: 'inbook' ];
					                   with: 'Capítulo de libro' ].
			                   html tbsDropdownMenuItem: [
				                   html anchor
					                   callback: [ self addEmpty: 'book' ];
					                   with: 'Libro' ].
			                   html tbsDropdownMenuItem: [
				                   html anchor
					                   callback: [ self addEmpty: 'techreport' ];
					                   with: 'Reporte técnico' ].
			                   html tbsDropdownMenuItem: [
				                   html anchor
					                   callback: [ self addEmpty: 'phdthesis' ];
					                   with: 'Tesis de doctorado' ].
			                   html tbsDropdownMenuItem: [
				                   html anchor
					                   callback: [ self addEmpty: 'masterthesis' ];
					                   with: 'Tesis de maestría' ].
			                   html tbsDropdownMenuItem: [
				                   html anchor
					                   callback: [ self addEmpty: 'misc' ];
					                   with: 'Otro (misc)' ] ].

			addAutomaticallyMenu := [
			                        html tbsDropdownMenuItem: [
				                        html anchor
					                        callback: [ self addPublicationFromDoi ];
					                        with: 'Con DOI' ].
			                        html tbsDropdownMenuItem: [
				                        html anchor
					                        callback: [
						                        self addPublicationFromBibtex ];
					                        with: 'Desde un registro Bibtex' ] ].

			html tbsButtonGroup: [
				html tbsDropdownButton
					beDefault;
					with: [
						html
							text: 'Agregar con formulario ';
							tbsCaret ].
				html tbsDropdownMenu: addWithFormMenu ].
			html space.
			html tbsButtonGroup: [
				html tbsDropdownButton
					beDefault;
					with: [
						html
							text: 'Agregar automáticamente ';
							tbsCaret ].
				html
					tbsDropdownMenu: addAutomaticallyMenu;
					space ] ]
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
		with: 'Otros'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'other')
		on: html
]
