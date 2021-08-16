rendering input
renderEditorInstructions: instructions on: html
	^ instructions
		ifNotNil: [ html small 
				class: 'form-text text-muted';
				with: instructions ]