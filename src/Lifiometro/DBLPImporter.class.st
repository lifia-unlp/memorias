Class {
	#name : #DBLPImporter,
	#superclass : #Object,
	#instVars : [
		'url',
		'years',
		'error',
		'entriesIgnoredAsUnkownTypes',
		'entriesIgnoredAsDuplicates',
		'titlesYearsToIgnore',
		'bibtexEntries'
	],
	#category : 'Lifiometro-Model'
}

{ #category : #'instance creation' }
DBLPImporter class >> url: aUrl [
	^ self new
		url: aUrl;
		yourself
]

{ #category : #accessing }
DBLPImporter >> bibtexEntries [
	^ bibtexEntries
]

{ #category : #accessing }
DBLPImporter >> cleanWeirdLatexAccentsIn: aString [
	| replacements newString |
	newString := aString.
	replacements := Dictionary new.
	replacements
		at: '{\''{a}}' put: 'á';
		at: '{\''{e}}' put: 'é';
		at: '{\''{i}}' put: 'í';
		at: '{\''{o}}' put: 'ó';
		at: '{\''{\i}}' put: 'i';
		at: '{\''{u}}' put: 'ú';
		at: 'l{\"{o}}' put: 'ö';
		at: 'l{\"{u}}' put: 'ü'.
	replacements
		associationsDo:
			[ :ass | newString := newString copyReplaceAll: ass key with: ass value ].
	^ newString
]

{ #category : #accessing }
DBLPImporter >> entriesIgnoredAsDuplicates [
	^ entriesIgnoredAsDuplicates
]

{ #category : #accessing }
DBLPImporter >> entriesIgnoredAsUnkownTypes [
	^ entriesIgnoredAsUnkownTypes
]

{ #category : #accessing }
DBLPImporter >> error [
	^ error
]

{ #category : #accessing }
DBLPImporter >> fetchIgnoringDuplicatesIn: aCollectionOfReferences [
	| candidateBibtexEntries |
	self ignore: aCollectionOfReferences.
	bibtexEntries := OrderedCollection new.
	entriesIgnoredAsUnkownTypes := OrderedCollection new.
	entriesIgnoredAsDuplicates := OrderedCollection new.
	DoiToBibAPI ensureBibtexMimeTypeIsNotBinary.
	[ candidateBibtexEntries := PPBibtexParser new
		parse: (ZnClient new get: url) copyWithoutWeirdLatexAccents ]
		on: Error
		do: [ :ex | 
			error := ex messageText.
			^ self ].
	(candidateBibtexEntries isNil or: [ candidateBibtexEntries isEmpty ])
		ifTrue: [ ^ self ].
	candidateBibtexEntries
		do: [ :each | 
			(self isOfUnkownType: each)
				ifTrue: [ entriesIgnoredAsUnkownTypes add: each ]
				ifFalse: [ (self seemsToBeADuplicate: each)
						ifTrue: [ entriesIgnoredAsDuplicates add: each ]
						ifFalse: [ bibtexEntries add: each ] ] ].
	years := (bibtexEntries collect: #year) asBag
]

{ #category : #accessing }
DBLPImporter >> ignore: aCollectionOrReferences [
	titlesYearsToIgnore := aCollectionOrReferences
		select: [ :each | each class = BibtexReference ]
		thenCollect: [ :each | 
			{each title onlyLetters.
			each year} ]
]

{ #category : #accessing }
DBLPImporter >> isOfUnkownType: aBibtexEntry [
	^ aBibtexEntry type
		ifNil: [ true ]
		ifNotNil: [ ({'inproceedings' . 'inbook' . 'book' . 'article'}
				includes: aBibtexEntry type) not ]
]

{ #category : #accessing }
DBLPImporter >> seemsToBeADuplicate: aBibtexEntry [
	^ titlesYearsToIgnore
		anySatisfy: [ :each | 
			each first = aBibtexEntry title onlyLetters
				& (each second = aBibtexEntry year) ]
]

{ #category : #accessing }
DBLPImporter >> url [
	^ url
]

{ #category : #accessing }
DBLPImporter >> url: anObject [
	url := anObject
]

{ #category : #accessing }
DBLPImporter >> years [
	^ years
]
