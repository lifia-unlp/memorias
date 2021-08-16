reports
reportForProject: aProject
	| publications scholarships researchers thesis |
	publications := (self references
		select: [ :each | each relatedProjects includes: aProject ])
		asSortedCollection: [ :a :b | a year < b year ].
	scholarships := (self scholarships
		select: [ :each | each relatedProjects includes: aProject ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	thesis := (self thesis
		select: [ :each | each relatedProjects includes: aProject ])
		asSortedCollection: [ :a :b | a startDate < b startDate ].
	researchers := aProject relatedLifians.
	^ ProjectReport 
		project: aProject
		researchers: researchers
		publications: publications
		scholarships: scholarships
		thesis: thesis