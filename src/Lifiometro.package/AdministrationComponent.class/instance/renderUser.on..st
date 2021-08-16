rendering
renderUser: each on: html
	html
		paragraph: [ html
				strong: each email;
				text: ' - Admin: '.
			html anchor
				callback: [ each toogleAdmin ];
				with: each isAdmin printString.
			html text: ' - Activado: '.
			html anchor
				callback: [ each toggleEnabled ];
				with: each enabled printString.
			each isPasswordSet
				ifTrue: [ html anchor
						callback: [ self clearPasswordFor: each ];
						with: ' - Limpiar password' ]
				ifFalse: [ html span
						style: 'color: red;';
						with: ' - Sin password' ] ]