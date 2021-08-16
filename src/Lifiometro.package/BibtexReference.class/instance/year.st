accessing
year
	[ bibtexEntry year asNumber ]
		on: Error
		do: [ ^ '1980' ].
	^ bibtexEntry year