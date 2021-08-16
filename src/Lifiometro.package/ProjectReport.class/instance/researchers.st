accessing
researchers
	^ researchers asSortedCollection: [ :a :b | a fullName < b fullName ]