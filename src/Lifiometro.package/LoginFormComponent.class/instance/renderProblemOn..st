rendering
renderProblemOn: html
	problem
		ifNotNil: [ html paragraph
				style: 'color: red;';
				with: problem ]