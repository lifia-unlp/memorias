accessing
items
	^ LifiometroRepository singleton projects
		asSortedCollection: [ :a :b | a endDate asDate > b endDate asDate ]