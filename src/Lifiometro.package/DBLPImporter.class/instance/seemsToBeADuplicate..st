accessing
seemsToBeADuplicate: aBibtexEntry
	^ titlesYearsToIgnore
		anySatisfy: [ :each | 
			each first = aBibtexEntry title onlyLetters
				& (each second = aBibtexEntry year) ]