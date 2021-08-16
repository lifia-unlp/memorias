accessing
save: anObject onBehalfOf: aUser
	anObject
		lastEditedOn: DateAndTime now;
		lastEditedBy: aUser;
		save