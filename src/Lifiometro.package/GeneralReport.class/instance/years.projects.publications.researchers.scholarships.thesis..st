initialization
years: theYears projects: theProjects publications: thePublications researchers: theResearchers scholarships: theScholarships thesis: theThesis
	years := theYears.
	projects := theProjects.
	inbookPublications := thePublications
		select: [ :each | each type = 'inbook' ].
	articlePublications := thePublications
		select: [ :each | each type = 'article' ].
	bookPublications := thePublications
		select: [ :each | each type = 'book' ].
	inproceedingsPublications := thePublications
		select: [ :each | each type = 'inproceedings' ].
	researchers := theResearchers.
	scholarships := theScholarships.
	undergraduateThesis := theThesis
		select: [ :each | each level = 'Undergraduate' ].
	phdThesis := theThesis select: [ :each | each level = 'PhD' ].
	mastersThesis := theThesis select: [ :each | each level = 'Masters' ].
	specializationThesis := theThesis
		select: [ :each | each level = 'Specialization' ]