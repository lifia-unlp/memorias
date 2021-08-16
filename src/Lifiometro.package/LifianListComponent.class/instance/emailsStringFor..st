rendering
emailsStringFor: each
	^ ({each personalEmail.
	each institutionalEmail} select: #notNil) asCommaString