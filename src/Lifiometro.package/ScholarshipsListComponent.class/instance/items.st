accessing
items
	^ LifiometroRepository singleton scholarships
		asSortedCollection: [ :a :b | a endDate asDate > b endDate asDate ]