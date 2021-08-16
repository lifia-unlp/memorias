instance creation
researcher: aResearcher publications: thePublications projects: theProjects scholarships: theScholarships thesis: theThesis
	researcher := aResearcher.
	publications := thePublications
		asSortedCollection: [ :a :b | a year asNumber > b year asNumber ].
	projects := theProjects
		asSortedCollection: [ :a :b | a startDate > b startDate ].
	scholarships := theScholarships
		asSortedCollection: [ :a :b | a startDate > b startDate ].
	thesis := theThesis
		asSortedCollection: [ :a :b | a startDate > b startDate ]