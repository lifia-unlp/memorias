accessing
enabled
	self isAdmin
		ifTrue: [ ^ true ].
	^ enabled ifNil: [ enabled := false ]