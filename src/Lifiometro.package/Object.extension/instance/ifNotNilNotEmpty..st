*Lifiometro
ifNotNilNotEmpty: aBlockClosure
	^ self ifNotNil: [ self ifNotEmpty: aBlockClosure ]