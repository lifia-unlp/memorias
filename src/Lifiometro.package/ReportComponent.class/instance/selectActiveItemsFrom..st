utility
selectActiveItemsFrom: aCollection
	| yearsAsNumbers |
	yearsAsNumbers := selectedYears collect: #asNumber.
	^ aCollection
		select:
			[ :each | each yearsActive anySatisfy: [ :year | yearsAsNumbers includes: year ] ]