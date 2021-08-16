rendering
renderContentOn: html
	html div
		id: #page;
		with: [ self renderHeaderOn: html.
			report := self fetchReport.
			report
				ifNil: [ ^ html
						render:
							'Por ahora no tengo información suficiente para generar el reporte. ¿Tal vez la URL no es correcta? ' ].
			self renderTitleOn: html.
			self renderPropertiesOn: html.
			self renderResearchersOn: html.
			self renderPublicationsOn: html.
			self renderProjectsOn: html.
			self renderScholarshipsOn: html.
			self renderThesisOn: html ]