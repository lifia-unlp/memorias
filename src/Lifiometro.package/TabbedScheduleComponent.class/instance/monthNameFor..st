initialization
monthNameFor: each
	[ each startDate asDate ]
		on: Error
		do: [ ^ self monthNames at: Date today monthIndex  ].
	^ self monthNames at: each startDate asDate monthIndex