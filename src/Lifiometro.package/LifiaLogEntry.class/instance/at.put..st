utility
at: aProperty put: aValue
	^ self perform: (aProperty , ':') asSymbol with: aValue