rendering
renderIndexOn: html
	html heading
		level1;
		with: 'Indice'.
	html
		unorderedList: [ html
				listItem: [ html anchor
						url: '#publications';
						with: 'Publicaciones' ].
			html unorderedList: [ self renderPublicationsIndexOn: html ].
			html
				listItem: [ html anchor
						url: '#thesis';
						with: 'Dirección de tesis y trabajos finales.' ].
			html unorderedList: [ self renderThesisIndexOn: html ].
			html
				listItem: [ html anchor
						url: '#scholarships';
						with: 'Becarios' ].
			html
				listItem: [ html anchor
						url: '#projects';
						with: 'Projectos' ].
			html
				listItem: [ html anchor
						url: '#researchers';
						with: 'Investigadores' ] ]