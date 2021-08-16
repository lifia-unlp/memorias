private
filter: aCollection toYears: years
	^ aCollection
		select:
			[ :each | each yearsActive anySatisfy: [ :year | years includes: year ] ]