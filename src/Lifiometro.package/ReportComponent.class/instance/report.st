report
report
	| selectedYearsAsNumbers |
	selectedYearsAsNumbers := selectedYears collect: #asNumber.
	(report notNil
		and: [ report years asSet = selectedYearsAsNumbers asSet ])
		ifTrue: [ ^ report ].
	report := LifiometroRepository singleton
		reportForYears: selectedYearsAsNumbers.
	^ report