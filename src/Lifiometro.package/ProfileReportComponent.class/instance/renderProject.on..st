rendering
renderProject: project on: html
	html
		paragraph: [ html text: project title , '.'.
			html space.
			project fundingAgency
				ifNotEmpty: [ :it | html text: 'Financiado por ' , it , '. ' ].
			project director
				ifNotEmpty: [ :it | html text: 'Dirigido por ' , it , '. ' ].
			project coDirector
				ifNotEmpty: [ :it | html text: 'CoDirigido por ' , it , '. ' ].
			html
				text:
					'Duración: ' , project startDate ddmmyyyy , '-'
						, project endDate ddmmyyyy ]