writing
publicationAsDictionary: aPublication
	| dict |
	dict := Dictionary new.
	dict
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'ScholarlyArticle'.
	aPublication selfArchivingUrl
		ifNotNil: [ :it | dict at: 'url' put: it ].
	dict at: 'description' put: aPublication asSummary.
	^ dict