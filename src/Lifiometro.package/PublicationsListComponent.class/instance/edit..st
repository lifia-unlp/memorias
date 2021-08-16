callbacks
edit: each
	| result |
	result := self call: (ReferenceEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result