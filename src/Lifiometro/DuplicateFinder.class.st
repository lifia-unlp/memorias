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
