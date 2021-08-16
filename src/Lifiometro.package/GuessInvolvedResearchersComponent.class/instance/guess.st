initialization
guess
	guesser := InvolvedResearchersGuesser new.
	guesser
		researchers: LifiometroRepository singleton lifians
		references: self referencesToGuess.
	guesser guess