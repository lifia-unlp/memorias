adding
render: each on: html
	| endDate |
	endDate := each endDate
		ifNil: [ '' ]
		ifNotNil: [ :it | each endDate asDate printString ].
	html
		paragraph: [ html
				strong: 'Alumno(s): ' , each student;
				break.
			html
				text: 'Fechas: ' , each startDate asDate printString , ' - ' , endDate;
				break.
			html
				text: 'Título: ' , each title;
				break.
			html
				text: 'Director(es): ' , each director;
				break.
			html
				text: 'Co-Director(es): ' , each coDirector;
				break.
			html
				text: 'Carrera: ' , each career;
				break.
			html
				text: 'Resumen: ' , each summary;
				break ]