accessing
miscPublications
	^ publications select: [ :each | each type = 'misc' ]