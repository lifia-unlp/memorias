initialization
initializeGroupingAndFilteringAdapter
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | self monthNameFor: each ]
		filteringBlock: [ :each :filter | 
			| startDate endDate |
			startDate := [ each startDate asDate ]
				on: Error
				do: [ Date today ].
			endDate := [ each endDate asDate ]
				on: Error
				do: [ Date today ].
			filter between: startDate year and: endDate year ]
		filters: (Date today year + 1 to: Date today year - 5 by: -1).
	groupingAndFilteringAdapter selectedFilter: Date today year