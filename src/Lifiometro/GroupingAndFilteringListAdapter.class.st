Class {
	#name : #GroupingAndFilteringListAdapter,
	#superclass : #Object,
	#instVars : [
		'list',
		'groupingBlock',
		'groups',
		'filteringBlock',
		'filters',
		'selectedFilter'
	],
	#category : 'Lifiometro-Web'
}

{ #category : #'instance creation' }
GroupingAndFilteringListAdapter class >> groupingBlock: aGroupingBlock filteringBlock: aFilteringBlock filters: aCollectionOfValues [
	^ self new
		groupingBlock: aGroupingBlock filteringBlock: aFilteringBlock filters: aCollectionOfValues;
		yourself
]

{ #category : #accessing }
GroupingAndFilteringListAdapter >> filters [
	^ filters
]

{ #category : #accessing }
GroupingAndFilteringListAdapter >> group: label [
	| unfiltered |
	unfiltered := groups at: label ifAbsentPut: OrderedCollection new.
	selectedFilter ifNil: [ ^ unfiltered ].
	^ unfiltered
		select: [ :each | filteringBlock value: each value: selectedFilter ]
]

{ #category : #accessing }
GroupingAndFilteringListAdapter >> groupLabels [
	^ groups keys
]

{ #category : #initialization }
GroupingAndFilteringListAdapter >> groupingBlock: aGroupingBlock filteringBlock: aFilteringBlock filters: aCollectionOfValues [
	list := OrderedCollection new.
	filteringBlock := aFilteringBlock.
	groupingBlock := aGroupingBlock.
	filters := aCollectionOfValues.
	self updateGroupsAndFilters
]

{ #category : #accessing }
GroupingAndFilteringListAdapter >> list [
	^ list
]

{ #category : #accessing }
GroupingAndFilteringListAdapter >> list: aNewList [
	list := aNewList.
	self updateGroupsAndFilters
]

{ #category : #accessing }
GroupingAndFilteringListAdapter >> selectedFilter [
	^ selectedFilter
]

{ #category : #accessing }
GroupingAndFilteringListAdapter >> selectedFilter: anObject [
	selectedFilter := anObject
]

{ #category : #private }
GroupingAndFilteringListAdapter >> updateGroupsAndFilters [
	groups := list groupedBy: groupingBlock.

]
