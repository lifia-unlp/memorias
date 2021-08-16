initialization
renderContentOn: html
	html div
		id: #page;
		with: [ self renderHeaderOn: html.
			self renderProjectsOn: html ]