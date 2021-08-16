accessing
references
	^ RawReference selectAll , BibtexReference selectAll
		reject: [ :each | each trashed ]