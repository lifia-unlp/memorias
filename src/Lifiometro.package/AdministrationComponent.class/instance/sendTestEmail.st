callbacks
sendTestEmail
	| message |
	message := WAEmailMessage
		from: 'casco@lifia.info.unlp.edu.ar'
		to: 'casco@lifia.info.unlp.edu.ar'
		subject: 'Este es un correo de pruebas'.
	message
		body: 'Si te llega este correo es porque funciona la configuración'.
	message send