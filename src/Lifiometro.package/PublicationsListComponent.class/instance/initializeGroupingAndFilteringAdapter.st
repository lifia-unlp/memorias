initialization
initializeGroupingAndFilteringAdapter
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | each type ]
		filteringBlock: [ :each :filter | each year = filter ]
		filters:
			((Date today year + 1 to: Date today year - 5 by: -1)
				collect: #printString).
	groupingAndFilteringAdapter
		selectedFilter: Date today year printString