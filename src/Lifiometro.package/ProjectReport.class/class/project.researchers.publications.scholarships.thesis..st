instance creation
project: theProject researchers: theResearchers publications: thePublications scholarships: theScholarships thesis: theThesis
	^ self new
		project: theProject
			researchers: theResearchers
			publications: thePublications
			scholarships: theScholarships
			thesis: theThesis;
		yourself