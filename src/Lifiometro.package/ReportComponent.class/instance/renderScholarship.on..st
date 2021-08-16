rendering-scholarhips
renderScholarship: each on: html
	html paragraph
		style: 'padding: 10px;';
		with: [ html
				text: 'Alumno: ' , each student;
				break.
			html
				text:
					'Fechas: ' , each startDate asDate printString , ' - '
						, each endDate asDate printString;
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
				text: 'Financiador: ' , each fundingAgency;
				break.
			html
				text: 'Tipo de beca: ' , each type;
				break.
			html
				text: 'Resumen: ' , each summary;
				break ]