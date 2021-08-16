adding
items
	^ LifiometroRepository singleton  thesis
		asSortedCollection: [ :a :b | a startDate asDate > b startDate asDate ]