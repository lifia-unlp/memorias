rendering
renderPublicationsOn: html
	| publications |
	html heading level2 with: 'Publicaciones'.
	publications := (Dictionary new)
		at: 'Publicaciones en revistas' put: report articlePublications;
		at: 'Publicaciones en conferencias'
			put: report inproceedingsPublications;
		at: 'Libros' put: report bookPublications;
		at: 'Partes de libros' put: report inbookPublications;
		at: 'Otras publicaciones' put: report miscPublications;
		yourself.
	publications
		keysAndValuesDo: [ :title :articles | 
			articles
				ifNotEmpty: [ html label with: title. 
					articles do: [ :each | self renderPublication: each on: html ] ] ]