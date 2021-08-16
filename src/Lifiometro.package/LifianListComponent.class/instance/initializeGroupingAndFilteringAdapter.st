rendering
initializeGroupingAndFilteringAdapter
	| end |
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | 'default' ]
		filteringBlock: [ :each :filter | 
			end := each endDate
				ifNil: [ '1/1/2050' asDate ]
				ifNotNil: [ :it | it asDate ].
			filter between: each startDate asDate year and: end year ]
		filters: (Date today year + 1 to: Date today year - 5 by: -1).
	groupingAndFilteringAdapter selectedFilter: Date today year