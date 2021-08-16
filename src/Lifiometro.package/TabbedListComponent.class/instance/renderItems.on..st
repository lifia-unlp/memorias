rendering
renderItems: items on: html
	html
		tbsTable: [ html
				tableBody: [ items
						do: [ :each | 
							each trashed
								ifFalse: [ html
										tableRow: [ html
												tableData: [ self render: each on: html.
													html
														paragraph: [ self renderRelatedLifiansFor: each on: html.
															self renderRelatedProjectsFor: each on: html ].
													plainView
														ifFalse: [ self renderActionsFor: each on: html ] ] ] ] ] ] ]