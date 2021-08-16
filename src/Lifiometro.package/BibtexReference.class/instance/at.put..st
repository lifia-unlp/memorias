accessing
at: aPropertyName put: aValue
	(self instanceVariableProperties includes: aPropertyName)
		ifTrue: [ ^ self perform: aPropertyName asValidSelector asMutator with: aValue ].
	bibtexEntry at: aPropertyName put: aValue