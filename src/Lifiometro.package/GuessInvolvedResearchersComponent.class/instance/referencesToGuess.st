initialization
referencesToGuess
	^ LifiometroRepository singleton references
		select: [ :each | each relatedLifians isEmptyOrNil ]