rendering
renderContentOn: html
	html
		tbsPanel: [ html
				tbsPanelBody: [ self renderUrlFormOn: html.
					importer bibtexEntries
						ifNotNil: [ self renderYearSelectorsOn: html.
							self renderIgnoredOfUnknownTypeOn: html.
							self renderIgnoredAsDulicateOn: html.
							self renderArticleReviewListOn: html.
							self renderCancelAcceptButtonsOn: html ] ] ]