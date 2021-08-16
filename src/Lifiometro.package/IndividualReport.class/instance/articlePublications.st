accessing
articlePublications
	^ publications select: [ :each | each type = 'article' ]