rendering
cleanupTitlesAndAuthors
	self session references
		do: [ :each | 
			each cleanupWeirdLatexAccents.
			self session save: each ]