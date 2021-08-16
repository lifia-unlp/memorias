rendering
renderFullnameInputOn: html
	html
		tbsFormGroup: [ html label
				for: 'fullname';
				with: [ html text: 'Nombre completo' ].
			html textInput 
				id: 'fullname';
				tbsFormControl;
				on: #fullname of: self ]