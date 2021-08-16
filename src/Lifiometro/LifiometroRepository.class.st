Class {
	#name : #LifiometroRepository,
	#superclass : #Object,
	#instVars : [
		'latestReport'
	],
	#classInstVars : [
		'singleton'
	],
	#category : 'Lifiometro-Repository'
}

{ #category : #singleton }
LifiometroRepository class >> singleton [
	^ singleton ifNil: [ singleton := self new ]
]

{ #category : #tools }
LifiometroRepository >> checkConsistency [
	LifiaUser selectAll collect: [ :each | each printString ].
	BibtexReference selectAll collect: [ :each | each lastEditedBy printString].


]

{ #category : #private }
LifiometroRepository >> filter: aCollection toYears: years [
	^ aCollection
		select:
			[ :each | each yearsActive anySatisfy: [ :year | years includes: year ] ]
]

{ #category : #accessing }
LifiometroRepository >> lifianWithEmail: email [
	^ Lifian selectAll
		detect: [ :each | each institutionalEmail = email ]
		ifNone: [ nil ]
]

{ #category : #accessing }
LifiometroRepository >> lifians [
	^ Lifian selectAll reject: [ :each | each trashed ]
]

{ #category : #accessing }
LifiometroRepository >> projectWithVoyageId: void [
	^ Project selectAll
		detect: [ :each | each voyageId printString = void ]
		ifNone: [ nil ]
]

{ #category : #accessing }
LifiometroRepository >> projects [
	^ Project selectAll reject: [ :each | each trashed ]
]

{ #category : #accessing }
LifiometroRepository >> projectsActiveIn: years [
	^ self filter: self projects toYears: years
]

{ #category : #accessing }
LifiometroRepository >> references [
	^ RawReference selectAll , BibtexReference selectAll
		reject: [ :each | each trashed ]
]

{ #category : #accessing }
LifiometroRepository >> referencesActiveIn: years [
	^ self filter: self references toYears: years
]

{ #category : #accessing }
LifiometroRepository >> remove: anObject onBehalfOf: aUser [
	anObject
		trashed: true.
	self save: anObject onBehalfOf: aUser.
]

{ #category : #reports }
LifiometroRepository >> reportForProject: aProject [
	| publications scholarships researchers thesis |
	publications := (self references
		select: [ :each | each relatedProjects includes: aProject ])
		asSortedCollection: [ :a :b | a year < b year ].
	scholarships := (self scholarships
		select: [ :each | each relatedProjects includes: aProject ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	thesis := (self thesis
		select: [ :each | each relatedProjects includes: aProject ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	researchers := aProject relatedLifians.
	^ ProjectReport 
		project: aProject
		researchers: researchers
		publications: publications
		scholarships: scholarships
		thesis: thesis
]

{ #category : #reports }
LifiometroRepository >> reportForResearcher: aLifian [
	| publications scholarships projects thesis |
	publications := (self references
		select: [ :each | each relatedLifians includes: aLifian ])
		asSortedCollection: [ :a :b | a year < b year ].
	scholarships := (self scholarships
		select: [ :each | each relatedLifians includes: aLifian ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	thesis := (self thesis
		select: [ :each | each relatedLifians includes: aLifian ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	projects := (self projects
		select: [ :each | each relatedLifians includes: aLifian ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	^ ResearcherReport
		researcher: aLifian
		publications: publications
		projects: projects
		scholarships: scholarships
		thesis: thesis
]

{ #category : #reports }
LifiometroRepository >> reportForYears: years [
	(latestReport notNil and: [ latestReport years asSet = years asSet ])
		ifTrue: [ ^ latestReport ].
	latestReport := GeneralReport
		years: years
		projects: (self projectsActiveIn: years)
		publications: (self referencesActiveIn: years)
		researchers: (self researchersActiveIn: years)
		scholarships: (self scholarshipsActiveIn: years)
		thesis: (self thesisActiveIn: years).
	^ latestReport
]

{ #category : #accessing }
LifiometroRepository >> researcherWithVoyageId: void [
	^ Lifian selectAll
		detect: [ :each | each voyageId printString = void ]
		ifNone: [ nil ]
]

{ #category : #accessing }
LifiometroRepository >> researchers [
	^ self lifians
]

{ #category : #accessing }
LifiometroRepository >> researchersActiveIn: years [
	^ self filter: self researchers toYears: years
]

{ #category : #accessing }
LifiometroRepository >> save: anObject onBehalfOf: aUser [
	anObject
		lastEditedOn: DateAndTime now;
		lastEditedBy: aUser;
		save
]

{ #category : #accessing }
LifiometroRepository >> saveUser: aUser [
	aUser save
]

{ #category : #accessing }
LifiometroRepository >> scheduleItems [
	^ ScheduleItem selectAll reject: [ :each | each trashed ]
]

{ #category : #accessing }
LifiometroRepository >> scholarships [
	^ Scholarship selectAll reject: [ :each | each trashed ]
]

{ #category : #accessing }
LifiometroRepository >> scholarshipsActiveIn: years [
	^ self filter: self scholarships toYears: years
]

{ #category : #accessing }
LifiometroRepository >> thesis [
	^ Thesis selectAll reject: [ :each | each trashed ]
]

{ #category : #accessing }
LifiometroRepository >> thesisActiveIn: years [
	^ self filter: self thesis toYears: years
]

{ #category : #accessing }
LifiometroRepository >> userWithEmail: anEmailAddress [
	^ LifiaUser selectAll
		detect: [ :each | each email = anEmailAddress ]
		ifNone: [ nil ]
]

{ #category : #accessing }
LifiometroRepository >> users [
	^ LifiaUser selectAll
]
