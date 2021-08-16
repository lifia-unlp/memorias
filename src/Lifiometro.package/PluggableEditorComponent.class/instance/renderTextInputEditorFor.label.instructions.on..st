rendering input
renderTextInputEditorFor: property label: label instructions: instructions on: html
	| currentValue |
	currentValue := (newValues at: property) ifNil: [ '' ].
	html
		tbsFormGroup: [ html label
				for: property;
				with: label.
			(currentValue size > 80
				ifTrue: [ html textArea
						rows: 3;
						yourself ]
				ifFalse: [ html textInput ])
				tbsFormControl;
				callback: [ :value | newValues at: property put: value ];
				with: currentValue;
				id: property.
			self renderEditorInstructions: instructions on: html ]