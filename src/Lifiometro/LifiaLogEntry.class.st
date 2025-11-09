Class {
	#name : #LifiaLogEntry,
	#superclass : #Object,
	#instVars : [
		'lastEditedOn',
		'lastEditedBy',
		'trashed',
		'excludeFromReports',
		'relatedLifians',
		'relatedProjects',
		'slug',
		'tags'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #tags }
LifiaLogEntry >> addTag: aString [

	tags ifNil: [ tags := Set new ].
	tags add: aString
]

{ #category : #utility }
LifiaLogEntry >> at: aProperty [
	^ self perform: aProperty asSymbol
]

{ #category : #utility }
LifiaLogEntry >> at: aProperty put: aValue [
	^ self perform: (aProperty , ':') asSymbol with: aValue
]

{ #category : #accessing }
LifiaLogEntry >> excludeFromReports [
	^ excludeFromReports ifNil: [ ^ false ]
]

{ #category : #accessing }
LifiaLogEntry >> excludeFromReports: anObject [
	excludeFromReports := anObject
]

{ #category : #initialization }
LifiaLogEntry >> initialize [
	trashed := false
]

{ #category : #accessing }
LifiaLogEntry >> lastEditedBy [
	^ lastEditedBy
]

{ #category : #accessing }
LifiaLogEntry >> lastEditedBy: anObject [
	lastEditedBy := anObject
]

{ #category : #accessing }
LifiaLogEntry >> lastEditedOn [
	^ lastEditedOn
]

{ #category : #accessing }
LifiaLogEntry >> lastEditedOn: anObject [
	lastEditedOn := anObject
]

{ #category : #'testing-consistency' }
LifiaLogEntry >> obsoleteReferencesReport [

	^ ObsoleteReferencesReport
		  entry: self
		  obsoleteLifians: self obsoleteRelatedLifians
		  obsoleteThesis: self obsoleteRelatedThesis
		  obsoleteProjects: self obsoleteRelatedProjects
]

{ #category : #'testing-consistency' }
LifiaLogEntry >> obsoleteRelatedLifians [

	^ self relatedLifians select: #trashed
]

{ #category : #'testing-consistency' }
LifiaLogEntry >> obsoleteRelatedProjects [

	^ self relatedProjects select: #trashed
]

{ #category : #'testing-consistency' }
LifiaLogEntry >> obsoleteRelatedThesis [

	^ OrderedCollection new.
]

{ #category : #'testing-consistency' }
LifiaLogEntry >> pointsToObsoleteLifians [

	^ self obsoleteRelatedLifians notEmpty
]

{ #category : #'testing-consistency' }
LifiaLogEntry >> pointsToObsoleteProjects [

	^ self obsoleteRelatedProjects notEmpty
]

{ #category : #'testing-consistency' }
LifiaLogEntry >> pointsToObsoleteThesis [

	^ self obsoleteRelatedThesis notEmpty
]

{ #category : #accessing }
LifiaLogEntry >> propertyNames [
	self subclassResponsibility
]

{ #category : #accessing }
LifiaLogEntry >> relatedLifians [
	^ relatedLifians ifNil: [ ^ OrderedCollection new ]
]

{ #category : #accessing }
LifiaLogEntry >> relatedLifians: anObject [
	relatedLifians := anObject
]

{ #category : #accessing }
LifiaLogEntry >> relatedProjects [
	^ relatedProjects ifNil: [ ^ OrderedCollection new ]
]

{ #category : #accessing }
LifiaLogEntry >> relatedProjects: anObject [
	relatedProjects := anObject
]

{ #category : #accessing }
LifiaLogEntry >> relatedThesis [

	^ OrderedCollection new
]

{ #category : #tags }
LifiaLogEntry >> removeTag: aString [

	tags remove: aString ifAbsent: [  ]
]

{ #category : #'double dispatch' }
LifiaLogEntry >> renderAsNewsSubjectWith: aRenderer on: aCanvas [
	aRenderer renderLogEntry: self on: aCanvas 

]

{ #category : #private }
LifiaLogEntry >> slug [

	^ slug
]

{ #category : #private }
LifiaLogEntry >> slug: anObject [

	slug := anObject
]

{ #category : #slugs }
LifiaLogEntry >> suggestSlugBase [

	^ self class name
]

{ #category : #tags }
LifiaLogEntry >> tags [ 
  ^tags ifNil: [ Set new ].
]

{ #category : #tags }
LifiaLogEntry >> tags: aSet [
  tags := aSet 
]

{ #category : #accessing }
LifiaLogEntry >> trashed [
	^ trashed ifNil: [ trashed := false ]
]

{ #category : #accessing }
LifiaLogEntry >> trashed: anObject [
	trashed := anObject
]

{ #category : #utility }
LifiaLogEntry >> unlinkTrashedConnections [

	relatedLifians := relatedLifians ifNotNilNotEmpty: [ :them |
		                  them reject: [ :each | each trashed ] ].
	relatedProjects := relatedProjects ifNotNilNotEmpty: [ :them |
		                   them reject: [ :each | each trashed ] ]
]

{ #category : #accessing }
LifiaLogEntry >> yearsActive [
	| yearsActive |
	yearsActive := self endDate
		ifNil: [ self startDate asDate year to: Date today year ]
		ifNotNil: [ self startDate asDate year to: self endDate asDate year ].
	^ yearsActive
]
