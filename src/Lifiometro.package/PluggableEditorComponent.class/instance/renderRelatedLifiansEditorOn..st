rendering input
renderRelatedLifiansEditorOn: html
	| currentValue |
	currentValue := newValues at: 'relatedLifians'.
	html
		tbsFormGroup: [ html label
				for: 'relatedLifians';
				with: 'Investigadores involucrados'.
			html
				break;
				small: 'Use control+click para seleccionar varios'.
			html multiSelect
				list: self lifians;
				selected: currentValue;
				size: 10;
				class: 'form-control';
				labels: [ :lifian | lifian lastName , ', ' , lifian firstName ];
				callback: [ :value | newValues at: 'relatedLifians' put: value ];
				with: currentValue;
				id: 'relatedLifians' ]