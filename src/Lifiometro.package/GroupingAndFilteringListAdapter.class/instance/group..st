accessing
group: label
	| unfiltered |
	unfiltered := groups at: label ifAbsentPut: OrderedCollection new.
	selectedFilter ifNil: [ ^ unfiltered ].
	^ unfiltered
		select: [ :each | filteringBlock value: each value: selectedFilter ]