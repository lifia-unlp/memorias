accessing
inbookPublications
	^ publications select: [ :each | each type = 'inbook' ]