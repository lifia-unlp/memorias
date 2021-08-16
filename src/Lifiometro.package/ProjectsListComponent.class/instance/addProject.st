rendering
addProject
	| result |
	result := self
		call:
			(ProjectEditorComponent  new
				item: Project new;
				yourself).
	result ifNotNil: [ self session save: result ]