accessing
withSimplifiedAnds: aStringToClean
	| parts stream |
	aStringToClean ifNil: [ ^ '' ].
	stream := String new writeStream.
	aStringToClean
		do: [ :each | 
			(each = Character lf or: [ each = Character cr ])
				ifTrue: [ stream nextPut: Character space ]
				ifFalse: [ stream nextPut: each ] ].
	parts := stream contents withBlanksCondensed splitOn: ' and '.
	parts size < 3
		ifTrue: [ ^ stream contents ].
	stream := String new writeStream.
	(parts copyFrom: 1 to: parts size - 1)
		do: [ :each | stream nextPutAll: each ]
		separatedBy: [ stream nextPutAll: ', ' ].
	stream
		nextPutAll: ' and ';
		nextPutAll: parts last.
	^ stream contents