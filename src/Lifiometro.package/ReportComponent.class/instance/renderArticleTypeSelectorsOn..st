rendering-form
renderArticleTypeSelectorsOn: html
	html
		tbsFormGroup: [ html
				label: 'Publicaciones a incluir';
				break.
			html checkbox
				value: article;
				callback: [ :value | article := value ].
			html space.
			html
				text: 'Artículos de revista';
				break.
			html checkbox
				value: inproceedings;
				callback: [ :value | inproceedings := value ].
			html space.
			html
				text: 'Artículos de conferencias ';
				break.
			html checkbox
				value: inbook;
				callback: [ :value | inbook := value ].
			html space.
			html
				text: 'Capítulos de libro';
				break.
			html checkbox
				value: book;
				callback: [ :value | book := value ].
			html space.
			html
				text: 'Libros';
				break ]