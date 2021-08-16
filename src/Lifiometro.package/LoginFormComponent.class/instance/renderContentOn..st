rendering
renderContentOn: html
	html
		tbsForm: [ self renderProblemOn: html.
			self renderInputElementsOn: html.
			self renderButtonsOn: html ]