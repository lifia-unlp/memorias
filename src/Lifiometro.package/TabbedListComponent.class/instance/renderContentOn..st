rendering
renderContentOn: html
	groupingAndFilteringAdapter list: self items.
	html tbsPanel
		with: [ html
				tbsPanelBody: [ html render: filteringTabsComponent.
					plainView
						ifFalse: [ self renderButtonsOn: html ].
					self renderItemsOn: html ] ]