rendering
renderButtonsOn: html
	html div
		style: 'padding-top:10px;padding-bottom:10px';
		with: [ html anchor
				callback: [ self addPublicationFromDoi ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar con DOI' ].
			html space.
			html anchor
				callback: [ self addPublicationFromBibtex ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar de bibtex' ].
			html space.
			html anchor
				callback: [ self addPublicationFromRawCite ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar a mano' ] ]