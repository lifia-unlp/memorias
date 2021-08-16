accessing
inproceedingsPublications
	^ publications select: [ :each | each type = 'inproceedings' ]