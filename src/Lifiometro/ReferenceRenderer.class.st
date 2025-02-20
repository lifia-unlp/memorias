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
ReferenceRenderer >> renderBibtexAvailableIconFor: aBibtextReference on: aCanvas [

	aCanvas tbsGlyphIcon iconCheck
]

{ #category : #rendering }
ReferenceRenderer >> renderBookReference: aReference on: aCanvas [

	aReference authors ifNotNilNotEmpty: [ :authors |
		aCanvas text: authors , ', ' ].
	aReference editors ifNotNilNotEmpty: [ :editors |
		aCanvas text: editors , ', ed(s)., ' ].
	
	aCanvas text: aReference title.
	aReference address ifNotNilNotEmpty: [
		aCanvas text: ', ' , aReference address ].
	aReference year ifNotNilNotEmpty: [
		aCanvas text: ', ' , aReference year ].
	self renderDownloadIconFor: aReference on: aCanvas
]

{ #category : #rendering }
ReferenceRenderer >> renderChapterReference: aReference on: aCanvas [

	aCanvas text: aReference authors.
	aCanvas emphasis: ', "' , aReference title , '"'.
	aCanvas text: ', in ' , aReference booktitle.
	aReference volume ifNotNilNotEmpty: [
		aCanvas text: ', vol. ' , aReference volume ].
	aReference editors ifNotNilNotEmpty: [
		aCanvas text: ', ' , aReference editors , ', ed(s).' ].
	aReference publisher ifNotNilNotEmpty: [
		aCanvas text: ' ' , aReference publisher ].
	aReference year ifNotNilNotEmpty: [
		aCanvas text: ', ' , aReference year ].

	aReference pages ifNotNilNotEmpty: [
		aCanvas text: ', pp. ' , aReference pages ].
	aCanvas text: '.'.
	aReference doi ifNotNilNotEmpty: [ :doi |
		self renderDoi: doi on: aCanvas ].
	self renderDownloadIconFor: aReference on: aCanvas
]

{ #category : #rendering }
ReferenceRenderer >> renderConferenceArticleReference: aReference on: aCanvas [

	aCanvas text: aReference authors.
	aCanvas emphasis: ', "' , aReference title , '"'.
	aCanvas text: ', in ' , aReference booktitle.
	aReference volume ifNotNilNotEmpty: [
		aCanvas text: ', vol. ' , aReference volume ].
	aReference address ifNotNilNotEmpty: [
		aCanvas text: ', ' , aReference address ].
	aReference year ifNotNilNotEmpty: [
		aCanvas text: ', ' , aReference year ].

	aReference pages ifNotNilNotEmpty: [
		aCanvas text: ', pp. ' , aReference pages ].
	aCanvas text: '.'.
	aReference doi ifNotNilNotEmpty: [ :doi |
		self renderDoi: doi on: aCanvas ].
	self renderDownloadIconFor: aReference on: aCanvas
]

{ #category : #rendering }
ReferenceRenderer >> renderDoi: doi on: aCanvas [

	| realDoi |
	realDoi := doi startsWithDigit
		           ifTrue: [ 'https://doi.org/' , doi ]
		           ifFalse: [ doi ].
	^ aCanvas anchor
		  url: realDoi;
		  with: ' ' , doi , ' .'
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
ReferenceRenderer >> renderJournalArticleReference: aReference on: aCanvas [

	aCanvas text: aReference authors.
	aCanvas emphasis: ', "' , aReference title , '"'.
	aCanvas text: ', ' , aReference journal.
	aReference volume ifNotNilNotEmpty: [
		aCanvas text: ', vol. ' , aReference volume ].
	aReference number ifNotNilNotEmpty: [ ', ' , aReference number ].
	aReference pages ifNotNilNotEmpty: [
		aCanvas text: ', pp. ' , aReference pages ].
	aCanvas text: ', ' , aReference year , '.'.
	aReference doi ifNotNilNotEmpty: [ :doi |
		self renderDoi: doi on: aCanvas ].
	self renderDownloadIconFor: aReference on: aCanvas
]

{ #category : #rendering }
ReferenceRenderer >> renderRawReference: aRawReference on: aCanvas [

	aCanvas text: aRawReference asReference.
	self renderDownloadIconFor: aRawReference on: aCanvas
]
