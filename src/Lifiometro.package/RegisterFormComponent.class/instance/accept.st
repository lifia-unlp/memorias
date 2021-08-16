callbacks
accept
	problem := nil.
	self passwordsMatch
		ifFalse: [ problem := 'Las contraseñas no coinciden.'.
			^ self ].
	(LifiometroRepository singleton userWithEmail: email address) notNil
		ifTrue: [ problem := 'Ya existe un usuario con ese email.'.
			^ self ].
	parent
		register: email address
		withHashedPassword: (self hash: password)
		andName: fullname