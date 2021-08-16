rendering
renderButtonsOn: html
	html
		paragraph: [ html tbsButton
				beDefault;
				callback: [ self cancel ];
				with: 'Cancel'.
			html space.
			html tbsButton
				bePrimary;
				callback: [ self accept ];
				with: 'Accept' ]