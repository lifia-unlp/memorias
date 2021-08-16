rendering
renderUsersListOn: html
	^ html tbsPanel
		beDefault;
		with: [ html tbsPanelHeading: [ html label: 'Users' ].
			html
				tbsPanelBody: [ LifiometroRepository singleton users
						do: [ :each | self renderUser: each on: html ] ] ]