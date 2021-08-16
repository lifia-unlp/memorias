initialization
initialize
	super initialize.
	importer := DBLPImporter new.
	yearSelectors := Dictionary new.
	selectedArticles := OrderedCollection new