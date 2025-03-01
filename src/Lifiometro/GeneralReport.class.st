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
		'researchers',
		'otherPublications'
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
GeneralReport >> activeMastersThesis [

	^ self mastersThesis  select: #isActive. 
]

{ #category : #accessing }
GeneralReport >> activePhdThesis [

	^ self phdThesis select: #isActive. 
]

{ #category : #accessing }
GeneralReport >> activeProjects [

	^ self projects select: #isActive. 
]

{ #category : #accessing }
GeneralReport >> activeScholarships [

	^ self scholarships select: #isActive
]

{ #category : #accessing }
GeneralReport >> activeSpecializationThesis [

	^ self specializationThesis select: #isActive
]

{ #category : #accessing }
GeneralReport >> activeUndergraduateThesis [

	^ self undergraduateThesis select: #isActive
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

	^ self countsFor:  aListOfYearlyResults  considering: [:it | it year asNumber]
]

{ #category : #accessing }
GeneralReport >> countsFor: aListOfYearlyResults considering: aBlockToGetTheYear [

	^ ((aListOfYearlyResults collect: aBlockToGetTheYear) asBag
		   copyWithout: nil) sortedElements
]

{ #category : #accessing }
GeneralReport >> finishedMastersThesis [

	^ self mastersThesis reject: #isActive
]

{ #category : #accessing }
GeneralReport >> finishedPhdThesis [

	^ self phdThesis reject: #isActive. 
]

{ #category : #accessing }
GeneralReport >> finishedProjects [

	^ self projects reject: #isActive. 
]

{ #category : #accessing }
GeneralReport >> finishedScholarships [

	^ self scholarships reject: #isActive
]

{ #category : #accessing }
GeneralReport >> finishedSpecializationThesis [

	^ self specializationThesis reject: #isActive
]

{ #category : #accessing }
GeneralReport >> finishedUndergraduateThesis [

	^ self undergraduateThesis reject: #isActive
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
GeneralReport >> otherPublications [

	^ otherPublications
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

	| blockToGetTheYearOrNil |
	blockToGetTheYearOrNil := [ :ref |
	                          ref endYear
		                          ifNil: [ nil ]
		                          ifNotNil: [ :it | it asNumber ] ].

	^ Array
		  with: 'Tesis de doctorado'
			  ->
			  (self
				   countsFor: self phdThesis
				   considering: blockToGetTheYearOrNil)
		  with: 'Tesis de maestría' -> (self
				   countsFor: self mastersThesis
				   considering: blockToGetTheYearOrNil)
		  with: 'Tesinas de grado' -> (self
				   countsFor: self undergraduateThesis
				   considering: blockToGetTheYearOrNil)
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
	inbookPublications := thePublications select: [ :each |
		                      each type = 'inbook' ].
	articlePublications := thePublications select: [ :each |
		                       each type = 'article' ].
	bookPublications := thePublications select: [ :each |
		                    each type = 'book' ].
	inproceedingsPublications := thePublications select: [ :each |
		                             each type = 'inproceedings' ].
	otherPublications := thePublications reject: [ :each |
		                     { 'article'. 'inproceedings'. 'inbook'. 'book' }
			                     includes: each type ].
	researchers := theResearchers.
	scholarships := theScholarships.
	undergraduateThesis := theThesis select: [ :each |
		                       each level = 'Undergraduate' ].
	phdThesis := theThesis select: [ :each | each level = 'PhD' ].
	mastersThesis := theThesis select: [ :each | each level = 'Masters' ].
	specializationThesis := theThesis select: [ :each |
		                        each level = 'Specialization' ]
]
