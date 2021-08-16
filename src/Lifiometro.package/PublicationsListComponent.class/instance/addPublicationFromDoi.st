callbacks
addPublicationFromDoi
	| cite |
	cite := self call: DoiImportComponent new.
	cite ifNotNil: [ self session save: cite ]