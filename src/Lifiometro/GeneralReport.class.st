Class {
	#name : #GeneralReport,
	#superclass : #Object,
	#instVars : [
		'years',
		'articlePublications',
		'inbookPublications',
		'bookPublications',
		'inproceedingsPublications',
		'undergraduateThesis',
		'mastersThesis',
		'phdThesis',
		'projects',
		'scholarships',
		'specializationThesis',
		'researchers'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #'instance creation' }
GeneralReport class >> years: theYears projects: theProjects publications: thePublications researchers: theResearchers scholarships: theScholarships thesis: theThesis [
	^ self new
		years: theYears
			projects: theProjects
			publications: thePublications
			researchers: theResearchers
			scholarships: theScholarships
			thesis: theThesis;
		yourself
]

{ #category : #accessing }
GeneralReport >> articlePublications [
	^ articlePublications
]

{ #category : #accessing }
GeneralReport >> bookPublications [
	^ bookPublications
]

{ #category : #accessing }
GeneralReport >> countsFor: aListOfYearlyResults [

	^ self countsFor:  aListOfYearlyResults  considering: #year
]

{ #category : #accessing }
GeneralReport >> countsFor: aListOfYearlyResults considering: aSelectorToGetYear [

	^ ((aListOfYearlyResults collect: aSelectorToGetYear) asBag
		   copyWithout: nil) sortedElements
]

{ #category : #accessing }
GeneralReport >> inbookPublications [
	^ inbookPublications
]

{ #category : #accessing }
GeneralReport >> inproceedingsPublications [
	^ inproceedingsPublications
]

{ #category : #accessing }
GeneralReport >> mastersThesis [
	^ mastersThesis
]

{ #category : #accessing }
GeneralReport >> phdThesis [
	^ phdThesis
]

{ #category : #accessing }
GeneralReport >> projects [
	^ projects
]

{ #category : #accessing }
GeneralReport >> publicationCounts [

	^ Array
		  with:
		  'Articulos de revista'
		  -> (self countsFor: self articlePublications)
		  with: 'Articulos de conferencia'
			  -> (self countsFor: self inproceedingsPublications)
		  with:
		  'Capitulos de libro' -> (self countsFor: self inbookPublications)

]

{ #category : #accessing }
GeneralReport >> researchers [
	^ researchers
]

{ #category : #accessing }
GeneralReport >> scholarships [
	^ scholarships
]

{ #category : #accessing }
GeneralReport >> specializationThesis [
	^ specializationThesis
]

{ #category : #accessing }
GeneralReport >> thesisCounts [

	^ Array
		  with: 'Tesis de doctorado'
			  -> (self countsFor: self phdThesis considering: #endYear)
		  with: 'Tesis de maestría'
			  -> (self countsFor: self mastersThesis considering: #endYear)
		  with: 'Tesinas de grado'
			  ->
			  (self countsFor: self undergraduateThesis considering: #endYear)
]

{ #category : #accessing }
GeneralReport >> undergraduateThesis [
	^ undergraduateThesis
]

{ #category : #accessing }
GeneralReport >> years [
	^ years
]

{ #category : #accessing }
GeneralReport >> years: anObject [
	years := anObject
]

{ #category : #initialization }
GeneralReport >> years: theYears projects: theProjects publications: thePublications researchers: theResearchers scholarships: theScholarships thesis: theThesis [
	years := theYears.
	projects := theProjects.
	inbookPublications := thePublications
		select: [ :each | each type = 'inbook' ].
	articlePublications := thePublications
		select: [ :each | each type = 'article' ].
	bookPublications := thePublications
		select: [ :each | each type = 'book' ].
	inproceedingsPublications := thePublications
		select: [ :each | each type = 'inproceedings' ].
	researchers := theResearchers.
	scholarships := theScholarships.
	undergraduateThesis := theThesis
		select: [ :each | each level = 'Undergraduate' ].
	phdThesis := theThesis select: [ :each | each level = 'PhD' ].
	mastersThesis := theThesis select: [ :each | each level = 'Masters' ].
	specializationThesis := theThesis
		select: [ :each | each level = 'Specialization' ]
]
