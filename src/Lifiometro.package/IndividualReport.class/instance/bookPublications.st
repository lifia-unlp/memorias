accessing
bookPublications
	^ publications select: [ :each | each type = 'book' ]