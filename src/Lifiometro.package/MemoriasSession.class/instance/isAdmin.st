testing
isAdmin
	^ (self application preferenceAt: #adminEmail) trimBoth = currentUser email