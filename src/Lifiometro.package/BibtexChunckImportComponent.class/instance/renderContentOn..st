rendering
renderContentOn: html
	html tbsPanel
		with: [ html
				tbsPanelBody: [ self checkForErrors.
					bibtexEntry
						ifNil: [ self renderFetchFormOn: html ]
						ifNotNil: [ html
								tbsForm: [ self renderBibtexEntryOn: html.
									bibtexEntry type = 'incollection'
										ifTrue: [ self renderIncollectionDesambiguationOn: html ].
									self renderButtonsOn: html ] ].
					error
						ifNotNil: [ html tbsAlert
								beDanger;
								with: error ].
					error := nil ] ]