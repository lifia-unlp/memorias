rendering
renderContentOn: html
	html
		tbsContainer: [ html break.
			html
				tbsJumbotron: [ html
						tbsRow: [ self renderPresentationColumnOn: html.
							self renderLoginColumnOn: html ] ] ].
	self renderFooterNoteOn: html.
