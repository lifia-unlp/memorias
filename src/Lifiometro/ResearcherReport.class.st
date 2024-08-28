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
