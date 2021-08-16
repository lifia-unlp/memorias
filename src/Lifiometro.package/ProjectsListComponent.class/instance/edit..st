accessing
edit: each
	| result |
	result := self call: (ProjectEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result