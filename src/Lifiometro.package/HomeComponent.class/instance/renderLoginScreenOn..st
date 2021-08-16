rendering
renderLoginScreenOn: html
	html tbsContainer
		style: 'padding-top:20px;';
		with: [ html
				tbsJumbotron: [ html heading: 'Memorias del LIFIA'.
					html
						break;
						break.
					html
						paragraph: [ html
								text: 'Para ver y/o actualizar las memorias debe estar registrado.' ].
					html
						paragraph: [ html anchor
								url: self session oidcUrl;
								with: [ html tbsButton
										bePrimary;
										beLarge;
										with: 'Ingresar' ] ] ] ]