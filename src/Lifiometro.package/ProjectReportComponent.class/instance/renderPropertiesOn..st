rendering
renderPropertiesOn: html
	html heading level2 with: 'Ficha técnica'.
	html
		table: [ html
				tableRow: [ html
						tableData: 'Título:';
						tableData: report project title ].
			html
				tableRow: [ html
						tableData: 'Código:';
						tableData: report project code ].
			html
				tableRow: [ html
						tableData: 'Duración:';
						tableData:
							report project startDate asDate printString , ' - '
								, report project endDate asDate printString ].
			html
				tableRow: [ html
						tableData: 'Dirección:';
						tableData: report project director ].
			html
				tableRow: [ html
						tableData: 'Co-Dirección:';
						tableData: report project coDirector ].
			html
				tableRow: [ html
						tableData: 'Grupo responsable:';
						tableData: report project responsibleGroup ].
			html
				tableRow: [ html
						tableData: 'Financiador:';
						tableData: report project fundingAgency ].
			html
				tableRow: [ html
						tableData: 'Monto:';
						tableData: report project amount ].
			html
				tableRow: [ html
						tableData: 'Participantes (del LIFIA)';
						tableData: (report researchers collect: #fullName) asCommaStringAnd ] ].
	html heading level2 with: 'Resúmen'.
	html paragraph: report project summary