rendering
renderArticleReviewListOn: html
	selectedArticles := (importer bibtexEntries
		select: [ :each | yearSelectors at: each year ])
		collect: [ :each | BibtexReference bibtexEntry: each ].
	html heading
		level3;
		with: 'Articles to import (' , selectedArticles size printString , ')'.
	selectedArticles do: [ :each | html paragraph: each asSummary ]