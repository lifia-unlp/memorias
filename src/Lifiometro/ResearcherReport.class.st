Class {
	#name : #ResearcherReport,
	#superclass : #IndividualReport,
	#instVars : [
		'researcher'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #'instance-creation' }
ResearcherReport class >> researcher: aResearcher publications: thePublications projects: theProjects scholarships: theScholarships thesis: theThesis [
	^ self new
		researcher: aResearcher
			publications: thePublications
			projects: theProjects
			scholarships: theScholarships
			thesis: theThesis;
		yourself
]

{ #category : #'instance-creation' }
ResearcherReport class >> researcher: aResearcher publications: thePublications projects: theProjects students: theStudents [
	^ self new
		researcher: aResearcher
			publications: thePublications
			projects: theProjects
			students: theStudents;
		yourself
]

{ #category : #export }
ResearcherReport >> asJsonLDDictionary [
	^ JsonLDWriter new researcherReportAsDictionary: self
]

{ #category : #export }
ResearcherReport >> asJsonLD_old [
	| researcherDict writer |
	writer := JsonLDWriter new.
	researcherDict := writer researcherAsDictionary: researcher.
	researcherDict at: 'affiliation' put: writer lifiaAsDictionary.
	researcherDict
		at: 'http://xmlns.com/foaf/0.1/publications'
		put:
			(publications
				collect: [ :each | writer publicationAsDictionary: each ]).
	^ String
		streamContents: [ :stream | 
			(NeoJSONWriter on: stream)
				prettyPrint: true;
				nextPut: researcherDict ]
]

{ #category : #accessing }
ResearcherReport >> projects [
	^ projects
]

{ #category : #accessing }
ResearcherReport >> researcher [
	^ researcher
]

{ #category : #'instance creation' }
ResearcherReport >> researcher: aResearcher publications: thePublications projects: theProjects scholarships: theScholarships thesis: theThesis [
	researcher := aResearcher.
	publications := thePublications
		asSortedCollection: [ :a :b | a year asNumber > b year asNumber ].
	projects := theProjects
		asSortedCollection: [ :a :b | a startDate > b startDate ].
	scholarships := theScholarships
		asSortedCollection: [ :a :b | a startDate > b startDate ].
	thesis := theThesis
		asSortedCollection: [ :a :b | a startDate > b startDate ]
]
