callbacks
additem
	| result |
	result := self
		call:
			(ScheduleItemEditorComponent new
				item: ScheduleItem new;
				yourself).
	result ifNotNil: [ self session save: result ]