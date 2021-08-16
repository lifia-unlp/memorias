api
guess
	guesses := Dictionary new. 
	references
		do: [ :each | 
			(self guessResearchersFor: each)
				ifNotEmpty: [ :it | guesses at: each put: it ] ]