rendering
renderButtonsOn: html
	html div
		style: 'padding-top:10px;padding-bottom:10px';
		with: [ html anchor
				callback: [ self additem ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar' ].
			html space.
			html anchor
				callback: [ self print ];
				target: '_blank';
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Imprimir' ] ]