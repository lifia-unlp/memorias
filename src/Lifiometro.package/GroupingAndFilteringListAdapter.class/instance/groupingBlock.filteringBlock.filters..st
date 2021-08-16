initialization
groupingBlock: aGroupingBlock filteringBlock: aFilteringBlock filters: aCollectionOfValues
	list := OrderedCollection new.
	filteringBlock := aFilteringBlock.
	groupingBlock := aGroupingBlock.
	filters := aCollectionOfValues.
	self updateGroupsAndFilters