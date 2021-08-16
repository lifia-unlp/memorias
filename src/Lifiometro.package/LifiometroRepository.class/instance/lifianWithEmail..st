accessing
lifianWithEmail: email
	^ Lifian selectAll
		detect: [ :each | each institutionalEmail = email ]
		ifNone: [ nil ]