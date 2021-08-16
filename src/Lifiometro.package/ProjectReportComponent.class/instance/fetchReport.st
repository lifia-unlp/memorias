hooks
fetchReport
	| void project |
	void := self requestContext request at: 'vid'.
	void ifNil: [ ^ nil ].
	project := LifiometroRepository singleton projectWithVoyageId: void.
	project ifNil: [ ^ nil ].
	^ LifiometroRepository singleton reportForProject: project