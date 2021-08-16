rendering
renderUrlFormOn: html
	html
		tbsForm: [ html
				tbsFormGroup: [ html label
						for: 'url';
						with: 'URL of bibtex file'.
					html textInput
						tbsFormControl;
						on: #url of: importer;
						id: 'url';
						placeholder: 'https://dblp.uni-trier.de/pers/tb2/r/Rossi:Gustavo.bib'.
					html break.
					html tbsButton
						beDefault;
						callback: [ self answer: nil ];
						with: 'Cancelar'.
					html space.
					html tbsButton
						bePrimary;
						callback: [ self fetch ];
						with: 'Obtener' ] ]