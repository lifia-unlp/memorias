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
		'slug'
	],
	#category : #'Lifiometro-Model'
}

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
