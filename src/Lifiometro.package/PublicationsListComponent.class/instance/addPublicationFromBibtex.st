callbacks
addPublicationFromBibtex
	| cite |
	cite := self call: BibtexChunckImportComponent new.
	cite ifNotNil: [ self session save: cite ]