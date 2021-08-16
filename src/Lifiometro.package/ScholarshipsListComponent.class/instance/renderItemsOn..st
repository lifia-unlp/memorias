accessing
renderItemsOn: html
	self
		renderItems: (groupingAndFilteringAdapter group: 'default')
		on: html