accessing
isAdmin
	email = 'alejandro.casco.fernandez@gmail.com'
		ifTrue: [ ^ true ].
	^ isAdmin ifNil: [ isAdmin := false ]