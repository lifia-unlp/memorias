accessing
ignore: aCollectionOrReferences
	titlesYearsToIgnore := aCollectionOrReferences
		select: [ :each | each class = BibtexReference ]
		thenCollect: [ :each | 
			{each title onlyLetters.
			each year} ]