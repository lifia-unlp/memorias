rendering
renderLastUpdatedInfoOn: html
	item lastEditedOn
		ifNotNil: [ :date | 
			html
				paragraph:
					'Actualizado por ' , item lastEditedBy email , ' el '
						, date asDate ddmmyyyy , ' a las ' , date asTime hhmm24 ]