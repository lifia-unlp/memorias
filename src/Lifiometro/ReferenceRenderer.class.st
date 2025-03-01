Class {
	#name : #ReferenceRenderer,
	#superclass : #Object,
	#category : #'Lifiometro-Web-Renderers'
}

{ #category : #rendering }
ReferenceRenderer >> render: aReference on: aCanvas [

	aReference renderAsReferenceWith: self on: aCanvas 
]

{ #category : #rendering }
ReferenceRenderer >> renderAuthorsOf: aReference on: aCanvas [

	aReference authors ifNotNilNotEmpty: [ :authors |
		aCanvas text: authors , '. ' ].
]

{ #category : #rendering }
ReferenceRenderer >> renderBibtexAvailableIconFor: aBibtexEntry on: aCanvas [

	| iconTag escapedBibtexEntry |
	iconTag := aCanvas tbsGlyphIcon.
	iconTag iconCheck.
	escapedBibtexEntry := aBibtexEntry bibtexEntry printString
		        copyReplaceAll: Character cr asString
		        with: '\n'.
	escapedBibtexEntry := aBibtexEntry bibtexEntry printString copyReplaceAll: '"' with: '\"'.
	escapedBibtexEntry := aBibtexEntry bibtexEntry printString copyReplaceAll: '\' with: '\\'.
	iconTag
		id: 'bibtex-icon';
		onClick:
			'navigator.clipboard.writeText(''' , escapedBibtexEntry
			, '''); alert(''Copiado'');'
]

{ #category : #'rendering-types' }
ReferenceRenderer >> renderBookReference: aReference on: aCanvas [

	self renderAuthorsOf: aReference on: aCanvas.
	self renderYearOf: aReference on: aCanvas.
	aCanvas emphasis: [ self renderTitleOf: aReference on: aCanvas ].


	aReference edition ifNotNilNotEmpty: [ :it |
		aCanvas text: it , ' ed. ' ].
	aReference publisher ifNotNilNotEmpty: [ :it |
		aCanvas text: it.
		aReference address ifNotNilNotEmpty: [ :add |
			aCanvas text: ', ' , add , '. ' ] ].
	self renderDoiOf: aReference on: aCanvas.
	self renderDownloadIconFor: aReference on: aCanvas
]

{ #category : #'rendering-types' }
ReferenceRenderer >> renderChapterReference: aReference on: aCanvas [
	self renderAuthorsOf: aReference on: aCanvas.
	self renderYearOf: aReference on: aCanvas.
	self renderTitleOf: aReference on: aCanvas.
	aReference booktitle ifNotNilNotEmpty: [ :it |
		aCanvas text: ' In '.
		aCanvas emphasis: [ aCanvas text: it ].
		aCanvas text: '. ' ].
	aReference editors ifNotNilNotEmpty: [ :it | aCanvas text: it, ' (Eds.). ' ].
	aReference edition ifNotNilNotEmpty: [ :it | aCanvas text: it, ' ed. ' ].
	aReference publisher ifNotNilNotEmpty: [ :it |
		aCanvas text: it.
		aReference address ifNotNilNotEmpty: [ :add |
			aCanvas text: ', ' , add , ',' ].  ].
	aReference pages ifNotNilNotEmpty: [ :it | aCanvas text: ' ' , it, '. ' ].
	self renderDoiOf: aReference on: aCanvas.
	self renderDownloadIconFor: aReference on: aCanvas
]

{ #category : #'rendering-types' }
ReferenceRenderer >> renderConferenceArticleReference: aReference on: aCanvas [

	self renderAuthorsOf: aReference on: aCanvas.
	self renderYearOf: aReference on: aCanvas.
	self renderTitleOf: aReference on: aCanvas.
	aReference booktitle ifNotNilNotEmpty: [ :it |
		aCanvas text: ' In '.
		aCanvas emphasis: [ aCanvas text: it ].
		aCanvas text: '. ' ].
	aReference publisher ifNotNilNotEmpty: [ :it |
		aCanvas text: it.
		aReference address ifNotNilNotEmpty: [ :add |
			aCanvas text: ', ' , add , ',' ].  ].
	aReference pages ifNotNilNotEmpty: [ :it | aCanvas text: ' ' , it, '. ' ].
	self renderDoiOf: aReference on: aCanvas.
	self renderDownloadIconFor: aReference on: aCanvas
]

{ #category : #rendering }
ReferenceRenderer >> renderDoi: doi on: aCanvas [

	| realDoi |
	realDoi := doi startsWithDigit
		           ifTrue: [ 'https://doi.org/' , doi ]
		           ifFalse: [ doi ].
	aCanvas text: ' DOI:'.
	aCanvas anchor
		url: realDoi;
		with: realDoi
]

{ #category : #rendering }
ReferenceRenderer >> renderDoiOf: aReference on: aCanvas [

	aReference doi ifNotNilNotEmpty: [ :doi |
		self renderDoi: doi on: aCanvas ]
]

{ #category : #rendering }
ReferenceRenderer >> renderDownloadIconFor: aReference on: aCanvas [

	aReference selfArchivingUrl ifNotNil: [ :url |
		url ifNotEmpty: [
			aCanvas space.
			aCanvas anchor
				url: url;
				target: '_new';
				with: [ aCanvas tbsGlyphIcon class: 'glyphicon-save-file' ] ] ]
]

{ #category : #rendering }
ReferenceRenderer >> renderEditorsOf: aReference on: aCanvas [

	aReference editors ifNotNilNotEmpty: [ :it |
		aCanvas text: 'In ' , it , ' (Ed.), ' ]
]

{ #category : #'rendering-types' }
ReferenceRenderer >> renderJournalArticleReference: aReference on: aCanvas [

	self renderAuthorsOf: aReference on: aCanvas.
	self renderYearOf: aReference on: aCanvas.
	self renderTitleOf: aReference on: aCanvas.
	aReference journal ifNotNilNotEmpty: [ :it |
		aCanvas emphasis: [ aCanvas text: it ] ].
	aReference volume ifNotNilNotEmpty: [
		aReference number ifNotNilNotEmpty: [ :it |
			aCanvas text:
				' ' , aReference volume , ', ' , aReference number , ' ('
				, aReference year , ')' ] ].
	aReference pages ifNotNilNotEmpty: [ :it | aCanvas text: ', ' , it ].
	aCanvas text: '. '.
	self renderDoiOf: aReference on: aCanvas.
	self renderDownloadIconFor: aReference on: aCanvas
]

{ #category : #rendering }
ReferenceRenderer >> renderJournalOf: aReference on: aCanvas [

	aReference journal ifNotNilNotEmpty: [ :it | aCanvas text: it].
	aCanvas text: '42, 1'.
	aReference year ifNotNilNotEmpty: [ :it |
		aCanvas text: ' (' , it , ')' ].

]

{ #category : #'rendering-types' }
ReferenceRenderer >> renderRawReference: aRawReference on: aCanvas [

	aCanvas text: aRawReference asReference.
	self renderDownloadIconFor: aRawReference on: aCanvas
]

{ #category : #rendering }
ReferenceRenderer >> renderTitleOf: aReference on: aCanvas [

	aReference title ifNotNilNotEmpty: [ :it | aCanvas text: it, '. ' ]
]

{ #category : #rendering }
ReferenceRenderer >> renderYearOf: aReference on: aCanvas [

	aReference year ifNotNilNotEmpty: [ :it |
		aCanvas text: '', it, '. ' ].
]
