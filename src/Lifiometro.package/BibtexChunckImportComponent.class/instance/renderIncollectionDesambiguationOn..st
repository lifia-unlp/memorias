rendering
renderIncollectionDesambiguationOn: html
	html
		tbsFormGroup: [ html label
				for: 'type';
				with: 'Nuevo tipo'.
			html
				paragraph: [ html
						small: '"incollection" es un tipo ambiguo, seleccione uno de los siguientes.' ].
			html radioGroup
				callback: [ :value | newType := value ];
				selected: 'inbook';
				with: [ :group | 
					group radioButton value: 'inproceedings'.
					html
						space;
						text: 'Articulo de conferencia (inproceedings)';
						break.
					group radioButton value: 'inbook'.
					html
						space;
						text: 'Capítulo de libro (inbook)';
						break ] ]