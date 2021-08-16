rendering
renderRelatedLifiansFor: each on: html
	html
		text:
			'Investigadores: '
				,
					((each relatedLifians ifNil: [ Set new ])
						collect: [ :lifian | lifian fullName ]) asCommaString.