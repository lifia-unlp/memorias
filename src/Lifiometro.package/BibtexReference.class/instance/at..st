accessing
at: aPropertyName
	(self instanceVariableProperties includes: aPropertyName)
		ifTrue: [ ^ self perform: aPropertyName asValidSelector ].
	^ (bibtexEntry at: aPropertyName) ifNil: [ '' ]