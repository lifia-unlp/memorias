callbacks
accept
	self problemsExist
		ifTrue: [ ^ self ].
	parent login: email address withHashedPassword: (self hash: password).
	email := ''.
	password := ''