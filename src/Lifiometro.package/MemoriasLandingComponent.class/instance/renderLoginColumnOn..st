rendering
renderLoginColumnOn: html
	^ html
		tbsColumn: [ html render: activeComponent.
			self renderLoginOrRegisterOfferOn: html ]
		mediumSize: 6