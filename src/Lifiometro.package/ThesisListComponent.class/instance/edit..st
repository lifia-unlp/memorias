rendering
edit: each
	| result |
	result := self call: (ThesisEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result