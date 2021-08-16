rendering
edit: each
	| result |
	result := self call: (ScholarshipEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result