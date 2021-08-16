reports
reportForResearcher: aLifian
	| publications scholarships projects thesis |
	publications := (self references
		select: [ :each | each relatedLifians includes: aLifian ])
		asSortedCollection: [ :a :b | a year < b year ].
	scholarships := (self scholarships
		select: [ :each | each relatedLifians includes: aLifian ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	thesis := (self thesis
		select: [ :each | each relatedLifians includes: aLifian ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	projects := (self projects
		select: [ :each | each relatedLifians includes: aLifian ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	^ ResearcherReport
		researcher: aLifian
		publications: publications
		projects: projects
		scholarships: scholarships
		thesis: thesis