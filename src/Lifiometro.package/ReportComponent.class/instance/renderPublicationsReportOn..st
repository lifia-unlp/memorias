rendering-publications
renderPublicationsReportOn: html
	article | inbook | inproceedings | book
		ifTrue: [ html heading
				level1;
				id: 'publications';
				with: 'Publicaciones' ].
	article
		ifTrue: [ html heading
				level2;
				id: 'article';
				with: 'Articulos de revista'.
			self renderPublicationsIn: self report articlePublications on: html ].
	inproceedings
		ifTrue: [ html heading
				level2;
				id: 'inproceedings';
				with: 'Articulos de conferencia'.
			self
				renderPublicationsIn: report inproceedingsPublications
				on: html ].
	inbook
		ifTrue: [ html heading
				level2;
				id: 'inbook';
				with: 'Capítulos de libro'.
			self renderPublicationsIn:  self report inbookPublications on: html ].
	book
		ifTrue: [ html heading
				level2;
				id: 'book';
				with: 'Libros'.
			self renderPublicationsIn:  self report bookPublications on: html ]