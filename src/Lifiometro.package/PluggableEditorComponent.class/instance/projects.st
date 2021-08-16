rendering input
projects
	^ LifiometroRepository singleton projects
		asSortedCollection: [ :a :b | a startDate > b startDate ]