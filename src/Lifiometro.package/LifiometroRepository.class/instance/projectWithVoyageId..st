accessing
projectWithVoyageId: void
	^ Project selectAll
		detect: [ :each | each voyageId printString = void ]
		ifNone: [ nil ]