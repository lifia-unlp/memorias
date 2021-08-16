initialization
initialize
	super initialize.
	finishedProjects := SortedCollection
		sortBlock: [ :a :b | a endDate > b endDate ].
	finishedProjects addAll: (self projects reject: #isActive).
	activeProjects := SortedCollection
		sortBlock: [ :a :b | a startDate > b startDate ].
	activeProjects addAll: (self projects select: #isActive)