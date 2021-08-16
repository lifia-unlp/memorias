accessing
remove: anObject onBehalfOf: aUser
	anObject
		trashed: true.
	self save: anObject onBehalfOf: aUser.