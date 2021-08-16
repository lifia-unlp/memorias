rendering
renderItemsOn: html
	| items |
	self monthNames
		do: [ :each | 
			items := groupingAndFilteringAdapter group: each.
			items notEmpty
				ifTrue: [ html heading
						level: 3;
						with: each.
					self renderItems: items on: html ] ]