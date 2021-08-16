rendering
renderThesis: thesis on: html
	| trans level |
	trans := Dictionary new.
	trans
		at: 'Masters' put: 'Master';
		at: 'Specialization' put: 'Especialización';
		at: 'PhD' put: 'Doctorado';
		at: 'Undergraduate' put: 'Tesina de grado'.
	level := trans at: thesis level ifAbsent: [ thesis level ].
	html
		paragraph: [ html text: thesis student.
			html text: ' (' , level , '). '.
			html text: thesis title , '. '.
			thesis career ifNotEmpty: [ :it | html text: it , '. ' ].
			thesis director
				ifNotEmpty: [ :it | html text: 'Dirigido por ' , it , '. ' ].
			thesis coDirector
				ifNotEmpty: [ :it | html text: 'Co-Dirigido por ' , it , '. ' ].
			html
				text:
					'Duración: ' , thesis startDate ddmmyyyy , ' - '
						, (thesis endDate ifNil: [ 'en curso' ] ifNotNil: [ :it | it ddmmyyyy ]) ]