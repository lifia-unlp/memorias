instance-creation
researcher: aResearcher publications: thePublications projects: theProjects scholarships: theScholarships thesis: theThesis
	^ self new
		researcher: aResearcher
			publications: thePublications
			projects: theProjects
			scholarships: theScholarships
			thesis: theThesis;
		yourself