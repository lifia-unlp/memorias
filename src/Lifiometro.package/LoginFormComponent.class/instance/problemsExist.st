callbacks
problemsExist
	problem := nil.
	password isEmpty | email isNil
		ifTrue:
			[ problem := 'No olvide ingresar una dirección de correo y contraseña válidas.'.
			^ true ].
	^ false