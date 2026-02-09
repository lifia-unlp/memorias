Class {
	#name : #DuplicateFinder,
	#superclass : #Object,
	#category : #'Lifiometro-Tools'
}

{ #category : #lifians }
DuplicateFinder >> findPotentialDuplicatesIn: aCollectionOfLifians forLifianWithFirstName: firstName andLastName: lastName [

	| damerauLevenshtein |
	damerauLevenshtein := AIDamerauLevenshteinDistance new.

	^ aCollectionOfLifians select: [ :each |
		  (damerauLevenshtein
			   distanceBetween:
			   ((each firstName , each lastName) asLowercase select: #isLetter)
			   and: ((firstName , lastName) asLowercase select: #isLetter))
		  < 2 ]
]

{ #category : #projects }
DuplicateFinder >> findPotentialDuplicatesIn: aCollectionOfProjects forProjectTitled: title startingOnYear: startYear [

	| damerauLevenshtein |
	damerauLevenshtein := AIDamerauLevenshteinDistance new.

	^ aCollectionOfProjects select: [ :each |
		  each startDate year = startYear and: [
			  (damerauLevenshtein
				   distanceBetween: (each title asLowercase select: #isLetter)
				   and: (title asLowercase select: #isLetter)) < 10 ] ]
]

{ #category : #references }
DuplicateFinder >> findPotentialDuplicatesIn: aCollectionOfReferences forReferenceTitled: aTitle [
 
	| damerauLevenshtein referecesToConsider |
	damerauLevenshtein := AIDamerauLevenshteinDistance new.
	referecesToConsider := aCollectionOfReferences select: [ :each |
		                       each propertyNames includes: 'title' ].

	^ referecesToConsider select: [ :each |
		  (damerauLevenshtein
			   distanceBetween: (each title asLowercase select: #isLetter)
			   and: (aTitle asLowercase select: #isLetter)) < 10 ]
]

{ #category : #scholarships }
DuplicateFinder >> findPotentialDuplicatesIn: aCollectionOfScholarships forStudentNamed: aName from: startDate to: endDate [

	| damerauLevenshtein scholarshipDuration |
	damerauLevenshtein := AIDamerauLevenshteinDistance new.
	scholarshipDuration := startDate to: endDate.

	^ aCollectionOfScholarships select: [ :each |
		  (scholarshipDuration intersection:
			   (each startDate to: each endDate)) notNil and: [
			  (damerauLevenshtein
				   distanceBetween: (each student asLowercase select: #isLetter)
				   and: (aName asLowercase select: #isLetter)) < 3 ] ]
]

{ #category : #thesis }
DuplicateFinder >> findPotentialDuplicatesIn: aCollectionOfThesis forThesisTitled: aTitle [

	| damerauLevenshtein |
	damerauLevenshtein := AIDamerauLevenshteinDistance new.

	^ aCollectionOfThesis select: [ :each |
		  (damerauLevenshtein
			   distanceBetween: (each title asLowercase select: #isLetter)
			   and: (aTitle asLowercase select: #isLetter)) < 10 ]
]

{ #category : #general }
DuplicateFinder >> findPotentialDuplicatesIn: aCollection with: duplicateSpottingBlock [

	| collectionCopy duplicates focus duplicatesOfFocus |
	duplicates := Set new.
	collectionCopy := aCollection copy.

	[ collectionCopy notEmpty ] whileTrue: [
		focus := collectionCopy removeFirst.
		duplicatesOfFocus := duplicateSpottingBlock
			                     value: collectionCopy
			                     value: focus.
		collectionCopy removeAll: duplicatesOfFocus.
		duplicatesOfFocus ifNotEmpty: [
			duplicates
				add: focus;
				addAll: duplicatesOfFocus ] ].
	^ duplicates
]

{ #category : #projects }
DuplicateFinder >> findPotentialProjectDuplicatesIn: aCollectionOfProjects [

	^ self
		  findPotentialDuplicatesIn: aCollectionOfProjects
		  with: [ :collection :focus |
			  self
				  findPotentialDuplicatesIn: collection
				  forProjectTitled: focus title
				  startingOnYear: focus startDate ]
]

{ #category : #references }
DuplicateFinder >> findPotentialReferenceDuplicatesIn: aCollectionOfReferences [

	| referecesToConsider |
	referecesToConsider := (aCollectionOfReferences select: [ :each |
		                        each propertyNames includes: 'title' ])
		                       asOrderedCollection.

	^ self
		  findPotentialDuplicatesIn: referecesToConsider
		  with: [ :collection :focus |
			  self
				  findPotentialDuplicatesIn: collection
				  forReferenceTitled: focus title ]
]

{ #category : #scholarships }
DuplicateFinder >> findPotentialScholarshipDuplicatesIn: aCollectionOfScholarships [

	^ self
		  findPotentialDuplicatesIn: aCollectionOfScholarships
		  with: [ :collection :focus |
			  self
				  findPotentialDuplicatesIn: collection
				  forStudentNamed: focus student
				  from: focus startDate
				  to: focus endDate ]
]

{ #category : #thesis }
DuplicateFinder >> findPotentialThesisDuplicatesIn: aCollectionOfThesis [

	^ self
		  findPotentialDuplicatesIn: aCollectionOfThesis
		  with: [ :collection :focus |
			  self
				  findPotentialDuplicatesIn: collection
				  forThesisTitled: focus title ]
]
