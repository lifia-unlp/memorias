login-register
register: anEmailAddress withHashedPassword: aHashedPassword andName: aName
	| theNewUser |
	theNewUser := LifiaUser new
		email: anEmailAddress;
		hashedPassword: aHashedPassword;
		fullname: aName;
		yourself.
	LifiaUser selectAll
		ifEmpty: [ theNewUser
				isAdmin: true;
				enabled: true ].
	self proceedWith: theNewUser