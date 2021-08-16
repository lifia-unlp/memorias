rendering
edit: each
	| result |
	result := self call: (LifianEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result