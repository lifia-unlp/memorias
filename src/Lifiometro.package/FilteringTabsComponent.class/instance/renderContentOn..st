rendering
renderContentOn: html
	| item |
	html tbsNav
		beTabs;
		with: [ (filteringAdapter filters reversed copyWith: nil)
				do: [ :each | 
					item := html tbsNavItem.
					filteringAdapter selectedFilter = each
						ifTrue: [ item beActive ].
					item
						with: [ html anchor
								callback: [ filteringAdapter selectedFilter: each ];
								with: (each ifNil: 'All') ] ] ]