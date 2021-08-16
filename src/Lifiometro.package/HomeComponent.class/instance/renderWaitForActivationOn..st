rendering
renderWaitForActivationOn: html
	html tbsContainer
		style: 'padding-top:20px;';
		with: [ html
				tbsJumbotron: [ html heading: 'Bienvenido!'.
					html
						break;
						break.
					html
						paragraph: [ html
								text: 'Su cuenta todavía no ha sido activada por los administradores.' ] ] ]