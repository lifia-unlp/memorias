rendering
addLifian
	| result |
	result := self
		call:
			(LifianEditorComponent new
				item: Lifian new;
				yourself).
	result ifNotNil: [ self session save: result ]