Class {
	#name : #PritableTabbedScheduleComponent,
	#superclass : #TabbedScheduleComponent,
	#category : #'Lifiometro-Web-Lists'
}

{ #category : #rendering }
PritableTabbedScheduleComponent >> renderActionsFor: each on: html [
	
]

{ #category : #rendering }
PritableTabbedScheduleComponent >> renderContentOn: html [
	groupingAndFilteringAdapter list: self items.
	html tbsPanel
		with: [ html
				tbsPanelBody: [ html div
						class: 'hidden-print';
						with: [ html render: filteringTabsComponent ].
					self renderItemsOn: html ] ]
]

{ #category : #style }
PritableTabbedScheduleComponent >> style [
	^ '@media print {
  a[href]:after {
    content: none
  }
}'
]
