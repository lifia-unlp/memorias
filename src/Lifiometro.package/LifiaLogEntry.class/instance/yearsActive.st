accessing
yearsActive
	| yearsActive |
	yearsActive := self endDate
		ifNil: [ self startDate asDate year to: Date today year ]
		ifNotNil: [ self startDate asDate year to: self endDate asDate year ].
	^ yearsActive