Class {
	#name : #LifiometroRepository,
	#superclass : #Object,
	#instVars : [
		'latestReport',
		'auditingEnabled'
	],
	#classInstVars : [
		'singleton'
	],
	#category : #'Lifiometro-Repository'
}

{ #category : #singleton }
LifiometroRepository class >> singleton [
	^ singleton ifNil: [ singleton := self new ]
]

{ #category : #auditing }
LifiometroRepository >> auditingEnabled [
	^ auditingEnabled
]

{ #category : #auditing }
LifiometroRepository >> auditingEnabled: anObject [
	auditingEnabled := anObject
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

{ #category : #initialization }
LifiometroRepository >> initialize [
	super initialize.
	auditingEnabled := true. 
]

{ #category : #query }
LifiometroRepository >> lifianWithEmail: email [
	^ Lifian selectAll
		detect: [ :each | each institutionalEmail = email ]
		ifNone: [ nil ]
]

{ #category : #query }
LifiometroRepository >> lifians [
	^ Lifian selectAll reject: [ :each | each trashed ]
]

{ #category : #query }
LifiometroRepository >> projectWithVoyageId: void [
	^ Project selectAll
		detect: [ :each | each voyageId printString = void ]
		ifNone: [ nil ]
]

{ #category : #query }
LifiometroRepository >> projects [
	^ Project selectAll reject: [ :each | each trashed ]
]

{ #category : #query }
LifiometroRepository >> projectsActiveIn: years [
	^ self filter: self projects toYears: years
]

{ #category : #query }
LifiometroRepository >> references [
	^ RawReference selectAll , BibtexReference selectAll
		reject: [ :each | each trashed ]
]

{ #category : #query }
LifiometroRepository >> referencesActiveIn: years [
	^ self filter: self references toYears: years
]

{ #category : #update }
LifiometroRepository >> remove: anObject onBehalfOf: aUser [
	| when |
	anObject trashed: true.
	when := DateAndTime now.
	anObject
		lastEditedOn: when;
		lastEditedBy: aUser;
		save.
	auditingEnabled
		ifTrue: [ (RepositoryAuditRecord
				what: anObject
				who: aUser
				when: DateAndTime now
				action: #remove) save ]
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

{ #category : #query }
LifiometroRepository >> researcherWithVoyageId: void [
	^ Lifian selectAll
		detect: [ :each | each voyageId printString = void ]
		ifNone: [ nil ]
]

{ #category : #query }
LifiometroRepository >> researchers [
	^ self lifians
]

{ #category : #query }
LifiometroRepository >> researchersActiveIn: years [
	^ self filter: self researchers toYears: years
]

{ #category : #update }
LifiometroRepository >> save: anObject onBehalfOf: aUser [
	| when |
	when := DateAndTime now.
	anObject
		lastEditedOn: when;
		lastEditedBy: aUser;
		save.
	auditingEnabled
		ifTrue: [ (RepositoryAuditRecord
				what: anObject
				who: aUser
				when: when
				action: #save) save ]
]

{ #category : #update }
LifiometroRepository >> saveUser: aUser [
	aUser save
]

{ #category : #query }
LifiometroRepository >> scheduleItems [
	^ ScheduleItem selectAll reject: [ :each | each trashed ]
]

{ #category : #query }
LifiometroRepository >> scholarships [
	^ Scholarship selectAll reject: [ :each | each trashed ]
]

{ #category : #query }
LifiometroRepository >> scholarshipsActiveIn: years [
	^ self filter: self scholarships toYears: years
]

{ #category : #query }
LifiometroRepository >> thesis [
	^ Thesis selectAll reject: [ :each | each trashed ]
]

{ #category : #query }
LifiometroRepository >> thesisActiveIn: years [
	^ self filter: self thesis toYears: years
]

{ #category : #query }
LifiometroRepository >> userWithEmail: anEmailAddress [
	^ LifiaUser selectAll
		detect: [ :each | each email = anEmailAddress ]
		ifNone: [ nil ]
]

{ #category : #query }
LifiometroRepository >> users [
	^ LifiaUser selectAll
]
