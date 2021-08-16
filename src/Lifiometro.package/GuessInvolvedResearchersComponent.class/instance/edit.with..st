rendering
edit: reference with: authors
	| result |
	reference relatedLifians: authors.
	result := self call: (ReferenceEditorComponent item: reference).
	result ifNil: [ ^ self ].
	guesser ignore: result.
	self session save: result