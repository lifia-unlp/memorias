Class {
	#name : #RawReference,
	#superclass : #PublicationReference,
	#instVars : [
		'year',
		'type',
		'reference'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #testing }
RawReference class >> isVoyageRoot [
	^ true 
]

{ #category : #converting }
RawReference >> asJsonLDWithWriter: aJsonLDWriter [
	^ aJsonLDWriter renderRawReference: self
]

{ #category : #printing }
RawReference >> asReference [
	^ reference
]

{ #category : #utility }
RawReference >> cleanupLatexAccentsAndBraces [
	^ self
]

{ #category : #accessing }
RawReference >> propertyNames [
	^ {'reference' . 'year' . 'selfArchivingUrl' . 'relatedLifians'. 'relatedProjects'}
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
