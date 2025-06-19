Class {
	#name : #RawReference,
	#superclass : #LifiaLogEntry,
	#instVars : [
		'year',
		'type',
		'reference',
		'ranking',
		'selfArchivingUrl',
		'relatedThesis'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #testing }
RawReference class >> isVoyageRoot [
	^ true 
]

{ #category : #printing }
RawReference >> asReference [
	^ reference
]

{ #category : #printing }
RawReference >> asSummary [
	^ self asReference
]

{ #category : #accessing }
RawReference >> bibtexPrintString [

	| key entry |
	key := self year
		       ifNil: [ Time millisecondClockValue printString ]
		       ifNotNil: [ self year asString ].
	entry := BibtexEntry emptyMisc.
	entry citationKey: 'raw' , key.
	entry at: 'note' put: self reference.
	entry at: 'year' put: self year.
	^ entry printString
]

{ #category : #utility }
RawReference >> cleanupLatexAccentsAndBraces [
	^ self
]

{ #category : #accessing }
RawReference >> propertyNames [
	^ {'reference' . 'year' . 'ranking'. 'selfArchivingUrl' . 'relatedLifians'. 'relatedProjects'. 'relatedThesis' }
]

{ #category : #accessing }
RawReference >> ranking [

	^ ranking
]

{ #category : #accessing }
RawReference >> ranking: anObject [

	ranking := anObject
]

{ #category : #accessing }
RawReference >> reference [
	^ reference
]

{ #category : #accessing }
RawReference >> reference: anObject [
	reference := anObject
]

{ #category : #accessing }
RawReference >> relatedThesis [
	^ relatedThesis
]

{ #category : #accessing }
RawReference >> relatedThesis: anObject [
	relatedThesis := anObject
]

{ #category : #'double dispatch' }
RawReference >> renderAsNewsSubjectWith: aRenderer on: aCanvas [
	aRenderer renderRawReference: self on: aCanvas 
]

{ #category : #rendering }
RawReference >> renderAsReferenceWith: aReferenceRenderer on: aCanvas [ 
	aReferenceRenderer renderRawReference: self on: aCanvas
]

{ #category : #accessing }
RawReference >> selfArchivingUrl [
	^ selfArchivingUrl
]

{ #category : #accessing }
RawReference >> selfArchivingUrl: anObject [
	selfArchivingUrl := anObject
]

{ #category : #accessing }
RawReference >> type [
	^ type
]

{ #category : #accessing }
RawReference >> type: anObject [
	type := anObject
]

{ #category : #accessing }
RawReference >> year [
	^ year
]

{ #category : #accessing }
RawReference >> year: anObject [
	year := anObject
]

{ #category : #accessing }
RawReference >> yearsActive [
        ^ {self year asNumber}
]
