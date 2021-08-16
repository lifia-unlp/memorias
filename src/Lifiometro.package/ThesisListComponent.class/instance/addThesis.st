adding
addThesis
	| result |
	result := self
		call:
			(ThesisEditorComponent new
				item: Thesis new;
				yourself).
	result ifNotNil: [ self session save: result ]