Class {
	#name : #DBConsistencyTest,
	#superclass : #TestCase,
	#category : #'Lifiometro-Tests'
}

{ #category : #tests }
DBConsistencyTest >> testBibtexReferences [

	| references |
	references := BibtexReference selectAll reject: [ :each |
		              each trashed ].
	self assert: (references select: [ :each |
			 (each relatedLifians select: #trashed) notEmpty ]) isEmpty.
	self assert: (references select: [ :each |
			 (each relatedThesis select: #trashed) notEmpty ]) isEmpty
]

{ #category : #tests }
DBConsistencyTest >> testLifian [
	| lifians names |
	lifians := Lifian selectAll reject: [ :each | each trashed ].
	names := lifians collect: #fullName.
	self assert: names size equals: names asSet size
]

{ #category : #tests }
DBConsistencyTest >> testProjects [

	| projects |
	projects := Project selectAll reject: [ :each | each trashed ].
	self assert:
		(projects select: [ :each | each title isEmpty ]) isEmpty.
	self assert: (projects select: [ :each |
			 each startDate notNil & (each startDate = '') ]) isEmpty.
	self assert: (projects select: [ :each |
			 (each relatedLifians select: #trashed) notEmpty ]) isEmpty
]

{ #category : #tests }
DBConsistencyTest >> testRawReferences [

	| references |
	references := RawReference selectAll reject: [ :each |
		              each trashed ].
	self assert: (references select: [ :each |
			 (each relatedLifians select: #trashed) notEmpty ]) isEmpty.
	self assert: (references select: [ :each |
			 (each relatedThesis select: #trashed) notEmpty ]) isEmpty
]

{ #category : #tests }
DBConsistencyTest >> testScholarships [

	| scholarships |
	scholarships := Scholarship  selectAll reject: [ :each | each trashed ].
	self assert:
		(scholarships select: [ :each | each title isEmptyOrNil  ]) isEmpty.
	self assert:
		(scholarships select: [ :each | each director isEmptyOrNil ]) isEmpty.
	self assert:
		(scholarships select: [ :each | each student isEmptyOrNil ]) isEmpty.
	self assert: (scholarships select: [ :each |
			 each startDate notNil & (each startDate = '') ]) isEmpty.
	self assert: (scholarships select: [ :each |
			 (each relatedLifians select: #trashed) notEmpty ]) isEmpty
]

{ #category : #tests }
DBConsistencyTest >> testThesis [

	| thesis |
	thesis := Thesis  selectAll reject: [ :each | each trashed ].
	self assert:
		(thesis select: [ :each | each title isEmptyOrNil  ]) isEmpty.
	self assert:
		(thesis select: [ :each | each director isEmptyOrNil ]) isEmpty.
	self assert:
		(thesis select: [ :each | each student isEmptyOrNil ]) isEmpty.
	self assert: (thesis select: [ :each |
			 each startDate notNil & (each startDate = '') ]) isEmpty.
	self assert: (thesis select: [ :each |
			 (each relatedLifians select: #trashed) notEmpty ]) isEmpty
]
