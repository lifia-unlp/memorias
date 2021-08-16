accessing
propertyNames
	| existing standardFields |
	existing := ((bibtexEntry tags
		select: [ :each | each value notEmpty ]) collect: #name) asSet.
	standardFields := Dictionary new.
	standardFields
		at: 'article'
			put:
			{'author' . 'title' . 'journal' . 'year' . 'volume' . 'number' . 'pages'.
			'month' . 'note'};
		at: 'inproceedings'
			put:
			{'author' . 'title' . 'booktitle' . 'year' . 'editor' . 'pages' . 'organization'.
			'publisher' . 'address' . 'month' . 'note'};
		at: 'inbook'
			put:
			{'author' . 'editor' . 'title' . 'chapter' . 'pages' . 'publisher'.
			'year' . 'volume' . 'series' . 'address' . 'edition' . 'month'.
			'note' . 'key'};
		at: 'book'
			put:
			{'author' . 'editor' . 'title' . 'publisher' . 'year' . 'volume'.
			'series' . 'address' . 'edition' . 'month' . 'note'}.
	existing addAll: (standardFields at: bibtexEntry type).
	existing
		add: 'selfArchivingUrl';
		add: 'relatedProjects';
		add: 'relatedLifians'.
	^ existing