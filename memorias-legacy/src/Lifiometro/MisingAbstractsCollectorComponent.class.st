Class {
	#name : #MisingAbstractsCollectorComponent,
	#superclass : #WAComponent,
	#instVars : [
		'articlesMissingAbstract',
		'abstractsToSet'
	],
	#category : #'Lifiometro-Tools'
}

{ #category : #rendering }
MisingAbstractsCollectorComponent >> acceptAll [

	abstractsToSet keysAndValuesDo:  [ :article :dictionary |
		article abstract: (dictionary at: 'abstract').
		self cleanUpTitleAndAuthorsOf: article.
		self session save: article ].

	articlesMissingAbstract removeAll: abstractsToSet keys.
	abstractsToSet := Dictionary new
]

{ #category : #rendering }
MisingAbstractsCollectorComponent >> cleanUpTitleAndAuthorsOf: reference [
   reference cleanupTitleAndAuthors.

]

{ #category : #rendering }
MisingAbstractsCollectorComponent >> compare: dictionary to: reference [

	^ reference selfArchivingUrl = (dictionary at: 'self_archiving_url')
]

{ #category : #callbacks }
MisingAbstractsCollectorComponent >> exportList [

	self requestContext respond: [ :response |
		response contentType: 'text/plain'.
		response
			headerAt: 'Content-Disposition'
			put: 'attachment; filename="publications_missing_abstract.txt"'.
		response nextPutAll: (String streamContents: [ :stream |
				 articlesMissingAbstract do: [ :each |
					 stream
						 nextPutAll: each selfArchivingUrl;
						 cr ] ]) ]
]

{ #category : #callbacks }
MisingAbstractsCollectorComponent >> importJson [

	| dictionaries count |
	dictionaries := self call: JsonImporter new.
	abstractsToSet := Dictionary new.
	count := 1.
	dictionaries do: [ :each |
		articlesMissingAbstract
			detect: [ :art | self compare: each to: art ]
			ifFound: [ :found | abstractsToSet at: found put: each ] ]
]

{ #category : #initialize }
MisingAbstractsCollectorComponent >> initialize [

	super initialize.
	abstractsToSet := Dictionary new.
	articlesMissingAbstract := OrderedCollection new
]

{ #category : #rendering }
MisingAbstractsCollectorComponent >> menu: html [

	html heading
		level2;
		with: 'Publications with empty or missing abstract'.
	html anchor
		callback: [ self updateList ];
		with: '[Update]'.
	html space.
	html anchor
		callback: [ self exportList ];
		with: '[Export]'.
	html space.
	html anchor
		callback: [ self importJson ];
		with: '[Import]'.

]

{ #category : #rendering }
MisingAbstractsCollectorComponent >> preview: dictionary for: reference on: html [

	| result editor |
	reference abstract: (dictionary at: 'abstract').
	self cleanUpTitleAndAuthorsOf: reference.
	editor := ReferenceEditorComponent item: reference.
	result := self call: editor.
	result ifNil: [ ^ self ].
	articlesMissingAbstract remove: result.
	abstractsToSet removeKey: result.
	self session save: result
]

{ #category : #rendering }
MisingAbstractsCollectorComponent >> renderAsFoundAbstracts: articles on: html [

	html heading
		level3;
		with: 'Articles with found abstracts'.
	html anchor
		callback: [ self acceptAll ];
		with: 'Accept all'.
	html unorderedList with: [
		articles do: [ :each |
			html listItem: each asReference.
			abstractsToSet at: each ifPresent: [ :it |
				html space.
				html anchor
					callback: [ self preview: it for: each on: html ];
					with: '[Preview]' ] ] ]
]

{ #category : #rendering }
MisingAbstractsCollectorComponent >> renderContentOn: html [

	html tbsPanel: [
		self renderMenuOn: html.
		self renderAsFoundAbstracts: abstractsToSet keys on: html.
		self
			renderReferencesWithMissingAbstract:
			(articlesMissingAbstract copyWithoutAll: abstractsToSet keys)
			on: html ].
	html anchor
		callback: [ self answer: nil ];
		with: 'Back'
]

{ #category : #rendering }
MisingAbstractsCollectorComponent >> renderMenuOn: html [

	html heading
		level2;
		with: 'Publications with empty or missing abstract'.
	html anchor
		callback: [ self updateList ];
		with: '[Update]'.
	html space.
	html anchor
		callback: [ self exportList ];
		with: '[Export]'.
	html space.
	html anchor
		callback: [ self importJson ];
		with: '[Import]'
]

{ #category : #rendering }
MisingAbstractsCollectorComponent >> renderReferencesWithMissingAbstract: articles on: html [

	html heading
		level3;
		with: 'Articles with still missing abstracts'.
	html unorderedList with: [
		articles do: [ :each |
			html listItem: each asReference.
			abstractsToSet at: each ifPresent: [ :it |
				html space.
				html anchor
					callback: [ self preview: it for: each on: html ];
					with: '[Edit]' ] ] ]

]

{ #category : #callbacks }
MisingAbstractsCollectorComponent >> updateList [

	articlesMissingAbstract := (LifiometroRepository singleton references
		                            select: [ :each |
			                            each abstract isEmptyOrNil
			                            & each trashed not
			                            &
			                            each selfArchivingUrl isEmptyOrNil not ])
		                           asSortedCollection: [ :a :b |
		                           a year >= b year ]
]
