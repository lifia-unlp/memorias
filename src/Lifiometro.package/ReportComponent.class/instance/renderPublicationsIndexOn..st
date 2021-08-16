rendering
renderPublicationsIndexOn: html
	html
		listItem: [ html anchor
				url: '#article';
				with: 'Publicaciones en revistas' ].
	html
		listItem: [ html anchor
				url: '#inproceedings';
				with: 'Publicaciones en conferencias' ].
	html
		listItem: [ html anchor
				url: '#inbook';
				with: 'Capítulos de libros' ].
	html
		listItem: [ html anchor
				url: '#book';
				with: 'Libros' ]