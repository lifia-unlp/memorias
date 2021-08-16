rendering
renderContentOn: html
	groupingAndFilteringAdapter list: self items.
	html tbsPanel
		with: [ html
				tbsPanelBody: [ html div
						class: 'hidden-print';
						with: [ html render: filteringTabsComponent ].
					self renderItemsOn: html ] ]