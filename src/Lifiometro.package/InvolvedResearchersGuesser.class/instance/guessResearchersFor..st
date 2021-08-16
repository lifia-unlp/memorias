api
guessResearchersFor: aReference
	^ researchers
		inject: Set new
		into: [ :guess :each | 
			((self normalize: aReference asSummary)
				includesSubstring: (self normalize: each lastName))
				ifTrue: [ guess add: each ].
			guess ]