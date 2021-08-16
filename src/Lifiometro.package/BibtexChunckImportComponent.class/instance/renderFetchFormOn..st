rendering
renderFetchFormOn: html
	html
		tbsForm: [ html
				tbsFormGroup: [ html label
						for: 'bibtex';
						with: 'Bibtex'.
					html textArea
						tbsFormControl;
						rows: 10;
						callback: [ :value | self parse: value ];
						with: '';
						id: 'bibtex';
						placeholder: '10.1430/8105 '.
					html break.
					html tbsButton
						beDefault;
						callback: [ self answer: nil ];
						with: 'Cancelar'.
					html space.
					html tbsButton
						bePrimary;
						callback: [ self fetch ];
						with: 'Procesar' ] ]