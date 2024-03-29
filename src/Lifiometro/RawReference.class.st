Class {
	#name : #RawReference,
	#superclass : #LifiaLogEntry,
	#instVars : [
		'year',
		'type',
		'reference',
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

{ #category : #utility }
RawReference >> cleanupLatexAccentsAndBraces [
	^ self
]

{ #category : #accessing }
RawReference >> propertyNames [
	^ {'reference' . 'year' . 'selfArchivingUrl' . 'relatedLifians'. 'relatedProjects'. 'relatedThesis' }
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
