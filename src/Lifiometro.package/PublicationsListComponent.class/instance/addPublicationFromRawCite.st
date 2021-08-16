callbacks
addPublicationFromRawCite
	| cite editor |
	editor := ReferenceEditorComponent new.
	editor item: RawReference new.
	cite := self call: editor.
	cite ifNotNil: [ self session save: cite ]