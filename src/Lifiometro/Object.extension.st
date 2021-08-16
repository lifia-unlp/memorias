Extension { #name : #Object }

{ #category : #'*Lifiometro' }
Object >> ifNotNilNotEmpty: aBlockClosure [
	^ self ifNotNil: [ self ifNotEmpty: aBlockClosure ]
]
