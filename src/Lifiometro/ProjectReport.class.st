Class {
	#name : #ProjectReport,
	#superclass : #IndividualReport,
	#instVars : [
		'researchers',
		'project'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #'instance creation' }
ProjectReport class >> project: theProject researchers: theResearchers publications: thePublications scholarships: theScholarships thesis: theThesis [
	^ self new
		project: theProject
			researchers: theResearchers
			publications: thePublications
			scholarships: theScholarships
			thesis: theThesis;
		yourself
]

{ #category : #converting }
ProjectReport >> asJsonLDDictionary [
	^ JsonLDWriter new projectReportAsDictionary: self
]

{ #category : #accessing }
ProjectReport >> project [
	^ project
]

{ #category : #initialization }
ProjectReport >> project: theProject researchers: theResearchers publications: thePublications scholarships: theScholarships thesis: theThesis [
	researchers := theResearchers.
	publications := thePublications.
	project := theProject.
	scholarships := theScholarships.
	thesis := theThesis
]

{ #category : #accessing }
ProjectReport >> researchers [
	^ researchers asSortedCollection: [ :a :b | a fullName < b fullName ]
]
