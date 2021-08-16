callbacks
fetch
	importer
		fetchIgnoringDuplicatesIn:
			(LifiometroRepository singleton references
				reject: [ :each | each trashed ])