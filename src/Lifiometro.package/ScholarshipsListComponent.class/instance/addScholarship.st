accessing
addScholarship
	| result |
	result := self
		call:
			(ScholarshipEditorComponent new
				item: Scholarship new;
				yourself).
	result ifNotNil: [ self session save: result ]