accessing
item: anItemWithProperties
	item := anItemWithProperties.
	item propertyNames
		do: [ :each | newValues at: each put: ((item at: each) ifNil: [ '' ]) ]