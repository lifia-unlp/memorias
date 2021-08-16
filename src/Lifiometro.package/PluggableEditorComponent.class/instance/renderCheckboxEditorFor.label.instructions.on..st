rendering input
renderCheckboxEditorFor: property label: label instructions: instructions on: html
	| currentValue |
	currentValue := (newValues at: property) ifNil: [ false ].
	html
		tbsFormGroup: [ html label
				for: property;
				with: label.
			html break.
			html checkbox
				callback: [ :value | newValues at: property put: value ];
				value: currentValue;
				id: property.
			html break.
			self renderEditorInstructions: instructions on: html ]