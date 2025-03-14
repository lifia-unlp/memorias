Class {
	#name : #LifiometroRepository,
	#superclass : #Object,
	#instVars : [
		'reportsCache',
		'auditingEnabled'
	],
	#classVars : [
		'PersistentConfigurationSingleton'
	],
	#classInstVars : [
		'singleton'
	],
	#category : #'Lifiometro-Repository'
}

{ #category : #singleton }
LifiometroRepository class >> resetSingleton [

	singleton := nil
]

{ #category : #singleton }
LifiometroRepository class >> singleton [
	^ singleton ifNil: [ singleton := LifiometroRepository  new ]
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

{ #category : #'reports-private' }
LifiometroRepository >> clearReportsCache [
	reportsCache := nil
]

{ #category : #'reports-private' }
LifiometroRepository >> createReportForProject: aProject [
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

{ #category : #'reports-private' }
LifiometroRepository >> createReportForResearcher: aLifian [
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

{ #category : #'reports-private' }
LifiometroRepository >> createReportForThesis: thesis [
	| publications |
	publications := (self references
		select: [ :each | 
			each relatedThesis
				ifNil: [ false ]
				ifNotNil: [ :relatedThesis | relatedThesis includes: thesis ] ])
		asSortedCollection: [ :a :b | a year < b year ].
	^ ThesisReport thesis: thesis publications: publications
]

{ #category : #'reports-private' }
LifiometroRepository >> createReportForYears: years [
	^ GeneralReport
		years: years
		projects: (self projectsActiveIn: years)
		publications: (self referencesActiveIn: years)
		researchers: (self researchersActiveIn: years)
		scholarships: (self scholarshipsActiveIn: years)
		thesis: (self thesisActiveIn: years)
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

{ #category : #configuration }
LifiometroRepository >> persistenConfiguration [

	^ PersistentConfigurationSingleton ifNil: [
		  PersistentConfigurationSingleton := PersistentConfiguration
			                                      selectAll
			                                      ifEmpty: [
				                                      PersistentConfiguration new
					                                      save;
					                                      yourself ]
			                                      ifNotEmpty: [ :all |
			                                      all first ] ]
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
				action: 'remove') save ]
]

{ #category : #reports }
LifiometroRepository >> reportForProject: aProject [
	^ self reportsCache
		at: aProject
		ifAbsentPut: [ self createReportForProject: aProject ]
]

{ #category : #reports }
LifiometroRepository >> reportForResearcher: aLifian [
	^ self reportsCache
		at: aLifian
		ifAbsentPut: [ self createReportForResearcher: aLifian ]
]

{ #category : #reports }
LifiometroRepository >> reportForThesis: aThesis [
	^ self reportsCache
		at: aThesis
		ifAbsentPut: [ self createReportForThesis: aThesis ]
]

{ #category : #reports }
LifiometroRepository >> reportForYears: years [
	^ self reportsCache
		at: years
		ifAbsentPut: [ self createReportForYears: years ]
]

{ #category : #'reports-private' }
LifiometroRepository >> reportsCache [
	^ reportsCache ifNil: [ reportsCache := Dictionary new ]
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
	self clearReportsCache. 
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
				action: 'save') save ]
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
LifiometroRepository >> thesisWithVoyageId: void [
	^ Thesis selectAll
		detect: [ :each | each voyageId printString = void ]
		ifNone: [ nil ]
]

{ #category : #query }
LifiometroRepository >> toDoItems [
	^ ToDoItem selectAll reject: [ :each | each trashed ]
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
