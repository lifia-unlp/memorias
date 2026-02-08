Class {
	#name : #DuplicateFinder,
	#superclass : #Object,
	#category : #'Lifiometro-Tools'
}

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
