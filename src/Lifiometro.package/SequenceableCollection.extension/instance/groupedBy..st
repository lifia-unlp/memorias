*Lifiometro
groupedBy: aBlock
	"improve it using streams"

	| groups |
	groups := Dictionary new.
	self
		do: [ :each | 
			(groups at: (aBlock value: each) ifAbsentPut: OrderedCollection new)
				add: each ].
	^ groups