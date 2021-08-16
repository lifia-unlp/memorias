rendering input
renderTextInputEditorFor: property on: html
	| currentValue |
	currentValue := newValues at: property.
	html
		tbsFormGroup: [ html label
				for: property;
				with: property asCapitalizedPhrase.
			(currentValue size > 80
				ifTrue: [ html textArea
						rows: 3;
						yourself ]
				ifFalse: [ html textInput ])
				tbsFormControl;
				callback: [ :value | newValues at: property put: value ];
				with: currentValue;
				id: property ]