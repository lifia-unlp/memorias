rendering
fetchReport
	| void project |
	void := self requestContext request at: 'vid'.
	void ifNil: [ ^ nil ].
	project := LifiometroRepository singleton researcherWithVoyageId: void.
	project ifNil: [ ^ nil ].
	^ LifiometroRepository singleton reportForResearcher: project