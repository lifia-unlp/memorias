callbacks
edit: each
	| result |
	result := self call: (ScheduleItemEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result