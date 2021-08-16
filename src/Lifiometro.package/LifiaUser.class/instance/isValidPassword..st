password
isValidPassword: aHashedPassword
	"If password is not set, set it on the first check"

	hashedPassword ifNil: [ hashedPassword := aHashedPassword ].
	^ hashedPassword = aHashedPassword