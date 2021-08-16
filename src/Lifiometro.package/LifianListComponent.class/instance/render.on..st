rendering
render: each on: html
	html
		paragraph: [ html
				strong: each lastName , ', ' , each firstName;
				break.
			each category
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Categoria de incentivos: ' , it;
						break ].
			each positionAtCIC
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Cargo en CICPBA: ' , it;
						break ].
			each positionAtCONICET
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Cargo en CONICET: ' , it;
						break ].
			html
				text: 'Cargo docente en UNLP: ' , each positionAtUnlp;
				break.
			html text: 'E-mails: ' , (self emailsStringFor: each) ]