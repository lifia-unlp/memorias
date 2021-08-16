Class {
	#name : #FilteringTabsComponent,
	#superclass : #WAComponent,
	#instVars : [
		'filteringAdapter'
	],
	#category : 'Lifiometro-Web'
}

{ #category : #'instance creation' }
FilteringTabsComponent class >> on: aGroupingAndFilteringListAdapter [
	^ self new
		filteringAdapter: aGroupingAndFilteringListAdapter;
		yourself
]

{ #category : #accessing }
FilteringTabsComponent >> filteringAdapter: anObject [
	filteringAdapter := anObject
]

{ #category : #rendering }
FilteringTabsComponent >> renderContentOn: html [
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
]
