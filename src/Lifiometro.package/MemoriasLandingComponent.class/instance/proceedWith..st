login-register
proceedWith: aUser
	self session currentUser: aUser.
	aUser lastConnected: DateAndTime now.
	LifiometroRepository singleton saveUser: aUser.
	aUser enabled
		ifTrue: [ self call: HomeComponent new ]
		ifFalse: [ self call: UserDisabledNoticeComponent new ]