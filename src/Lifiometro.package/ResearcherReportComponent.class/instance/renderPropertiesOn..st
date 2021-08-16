rendering
renderPropertiesOn: html
	html
		paragraph: [ html
				text: 'Nombre: ' , report researcher firstName;
				break.
			html
				text: 'Apellido: ' , report researcher lastName;
				break.
			report researcher startDate
				ifNotNil: [ :it | 
					html
						text: 'Ingreso: ' , it mmddyyyy;
						break ].
			report researcher endDate
				ifNotNil: [ :it | 
					html
						text: 'Egreso: ' , it mmddyyyy;
						break ].
			report researcher highestDegree
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Título máximo: ' , it;
						break ].
			report researcher institutionalEmail
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'E-mail: ' , it;
						break ].
			self renderExternalLinksOn: html ]