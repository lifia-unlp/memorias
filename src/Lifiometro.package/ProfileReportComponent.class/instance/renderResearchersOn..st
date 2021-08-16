rendering
renderResearchersOn: html
	html heading level2 with: 'Integrantes'.
	html
		unorderedList:
			[ report researchers do: [ :each | html listItem: each fullName ] ]