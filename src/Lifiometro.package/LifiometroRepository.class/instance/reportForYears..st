reports
reportForYears: years
	(latestReport notNil and: [ latestReport years asSet = years asSet ])
		ifTrue: [ ^ latestReport ].
	latestReport := GeneralReport
		years: years
		projects: (self projectsActiveIn: years)
		publications: (self referencesActiveIn: years)
		researchers: (self researchersActiveIn: years)
		scholarships: (self scholarshipsActiveIn: years)
		thesis: (self thesisActiveIn: years).
	^ latestReport