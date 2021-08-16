Class {
	#name : #BibtexURLImporterComponent,
	#superclass : #WAComponent,
	#instVars : [
		'importer',
		'yearSelectors',
		'selectedArticles'
	],
	#category : 'Lifiometro-Web'
}

{ #category : #callbacks }
BibtexURLImporterComponent >> fetch [
	importer
		fetchIgnoringDuplicatesIn:
			(LifiometroRepository singleton references
				reject: [ :each | each trashed ])
]

{ #category : #callbacks }
BibtexURLImporterComponent >> importSelected [
	selectedArticles do: [ :each | self session save: each ].
	self answer
]

{ #category : #initialization }
BibtexURLImporterComponent >> initialize [
	super initialize.
	importer := DBLPImporter new.
	yearSelectors := Dictionary new.
	selectedArticles := OrderedCollection new
]

{ #category : #rendering }
BibtexURLImporterComponent >> renderArticleReviewListOn: html [
	selectedArticles := (importer bibtexEntries
		select: [ :each | yearSelectors at: each year ])
		collect: [ :each | BibtexReference bibtexEntry: each ].
	html heading
		level3;
		with: 'Articles to import (' , selectedArticles size printString , ')'.
	selectedArticles do: [ :each | html paragraph: each asSummary ]
]

{ #category : #rendering }
BibtexURLImporterComponent >> renderCancelAcceptButtonsOn: html [
	html div
		style: 'padding-top:10px;';
		with: [ html anchor
				callback: [ self importSelected ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Import' ] ]
]

{ #category : #rendering }
BibtexURLImporterComponent >> renderContentOn: html [
	html
		tbsPanel: [ html
				tbsPanelBody: [ self renderUrlFormOn: html.
					importer bibtexEntries
						ifNotNil: [ self renderYearSelectorsOn: html.
							self renderIgnoredOfUnknownTypeOn: html.
							self renderIgnoredAsDulicateOn: html.
							self renderArticleReviewListOn: html.
							self renderCancelAcceptButtonsOn: html ] ] ]
]

{ #category : #rendering }
BibtexURLImporterComponent >> renderIgnoredAsDulicateOn: html [
	importer entriesIgnoredAsDuplicates ifEmpty: [ ^ self ].
	html heading
		level3;
		with:
			'Ignored as potential duplicates ('
				, importer entriesIgnoredAsDuplicates size printString , ')'.
	html
		paragraph:
			'For duplicates, only existing articles created from bibtex (not manually) were considered.'.
	importer entriesIgnoredAsDuplicates
		do:
			[ :each | html paragraph: (BibtexReference bibtexEntry: each) asSummary ]
]

{ #category : #rendering }
BibtexURLImporterComponent >> renderIgnoredOfUnknownTypeOn: html [
	| ignoredByType |
	importer entriesIgnoredAsUnkownTypes ifEmpty: [ ^ self ].
	html heading
		level3;
		with: 'Ignored as being of unknown types'.
	ignoredByType := (importer entriesIgnoredAsUnkownTypes collect: #type)
		asBag.
	ignoredByType asSet
		do: [ :each | 
			html
				text: each;
				text: ': ';
				text: (ignoredByType occurrencesOf: each) printString;
				break ]
]

{ #category : #rendering }
BibtexURLImporterComponent >> renderUrlFormOn: html [
	html
		tbsForm: [ html
				tbsFormGroup: [ html label
						for: 'url';
						with: 'URL of bibtex file'.
					html textInput
						tbsFormControl;
						on: #url of: importer;
						id: 'url';
						placeholder: 'https://dblp.uni-trier.de/pers/tb2/r/Rossi:Gustavo.bib'.
					html break.
					html tbsButton
						beDefault;
						callback: [ self answer: nil ];
						with: 'Cancelar'.
					html space.
					html tbsButton
						bePrimary;
						callback: [ self fetch ];
						with: 'Obtener' ] ]
]

{ #category : #rendering }
BibtexURLImporterComponent >> renderYearSelectorsOn: html [
	html
		tbsForm: [ html label: 'Select years to review'.
			html div
				style: 'padding:10px;';
				with: [ importer years asSet sorted reversed
						do: [ :each | 
							html checkbox
								id: each;
								value: (yearSelectors at: each ifAbsentPut: false);
								callback: [ :value | yearSelectors at: each put: value ].
							html space.
							html
								text: each;
								text: ' (';
								text: (importer years occurrencesOf: each);
								text: ')';
								break ] ].
			html tbsButton
				beDefault;
				beSmall;
				with: 'Update' ]
]
