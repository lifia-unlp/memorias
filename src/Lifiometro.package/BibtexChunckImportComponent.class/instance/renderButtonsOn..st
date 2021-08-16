rendering
renderButtonsOn: html
	html
		paragraph: [ html tbsButton
				beDefault;
				callback: [ self cancel ];
				with: 'Cancelar'.
			error ifNil: [ html space.
					html tbsButton
						bePrimary;
						callback: [ self accept ];
						with: 'Aceptar' ] ]