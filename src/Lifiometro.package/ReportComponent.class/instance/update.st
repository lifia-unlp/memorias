callbacks
update
	selectedYears := Set new.
	Date today year - (0 to: 5)
		with: lastFiveYearsSelectors
		do: [ :a :b | 
			b
				ifTrue: [ selectedYears add: a printString ] ].
	older
		ifTrue: [ selectedYears
				addAll: ((2000 to: Date today year - 6) collect: #printString) ]