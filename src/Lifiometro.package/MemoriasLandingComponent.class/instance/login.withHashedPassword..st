login-register
login: anEmailAddress withHashedPassword: aHashedPassword
	(LifiometroRepository singleton userWithEmail: anEmailAddress)
		ifNil: [ activeComponent problem: 'El usuario no existe' ]
		ifNotNil: [ :it | 
			(it isValidPassword: aHashedPassword)
				ifTrue: [ self proceedWith: it ]
				ifFalse: [ activeComponent problem: 'Contraseña incorrecta' ] ]