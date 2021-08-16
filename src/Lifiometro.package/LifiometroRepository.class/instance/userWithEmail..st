accessing
userWithEmail: anEmailAddress
	^ LifiaUser selectAll
		detect: [ :each | each email = anEmailAddress ]
		ifNone: [ nil ]