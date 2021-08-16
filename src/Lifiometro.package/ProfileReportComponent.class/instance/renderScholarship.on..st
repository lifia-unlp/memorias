rendering
renderScholarship: scholarship on: html
	html
		paragraph: [ html text: scholarship student.
			html text: ' (' , scholarship type , '). '.
			html text: scholarship title , '. '.
			scholarship fundingAgency
				ifNotEmpty: [ :it | html text: 'Financiado por ' , it , '. ' ].
			scholarship director
				ifNotEmpty: [ :it | html text: 'Dirigido por ' , it , '. ' ].
			scholarship coDirector
				ifNotEmpty: [ :it | html text: 'Co-Dirigido por ' , it , '. ' ].
			html
				text:
					'Duración: ' , scholarship startDate ddmmyyyy , '-'
						, scholarship endDate ddmmyyyy ]