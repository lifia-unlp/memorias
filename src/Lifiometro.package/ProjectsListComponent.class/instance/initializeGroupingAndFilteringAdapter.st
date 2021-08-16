initialization
initializeGroupingAndFilteringAdapter
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | 'default' ]
		filteringBlock: [ :each :filter | 
			filter
				between: each startDate asDate year
				and: each endDate asDate year ]
		filters: (Date today year + 1 to: Date today year - 5 by: -1).
	groupingAndFilteringAdapter selectedFilter: Date today year