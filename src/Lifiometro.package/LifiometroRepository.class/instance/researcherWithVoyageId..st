accessing
researcherWithVoyageId: void
	^ Lifian selectAll
		detect: [ :each | each voyageId printString = void ]
		ifNone: [ nil ]