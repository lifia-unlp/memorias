initialization
initialize
	super initialize.
	plainView := false.
	self initializeGroupingAndFilteringAdapter.
	filteringTabsComponent := FilteringTabsComponent
		on: groupingAndFilteringAdapter