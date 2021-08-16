rendering
render: each on: html
	html
		paragraph: [ html
				strong: each title;
				break.
			html
				text: 'Código: ' , each code;
				break.
			html
				text:
					'Fechas: ' , each startDate asDate printString , ' - '
						, each endDate asDate printString;
				break.
			html
				text: 'Director(es): ' , each director;
				break.
			html
				text: 'Co-Director(es): ' , each coDirector;
				break.
			html
				text: 'Grupo responsable: ' , each responsibleGroup;
				break.
			html
				text: 'Financiador: ' , each fundingAgency;
				break.
			html
				text: 'Monto: ' , each amount;
				break.
			html text: 'Resumen: ' , each summary ]