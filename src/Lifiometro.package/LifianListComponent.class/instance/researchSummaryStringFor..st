rendering
researchSummaryStringFor: each
	| positions |
	positions := OrderedCollection new.
	each category
		ifNotNil: [ :it | positions add: 'Categoria de Incentivos: ' , it ].
	each positionAtCIC
		ifNotNil: [ :it | positions add: 'Cargo CICPBA: ' , it ].
	each positionAtCONICET
		ifNotNil: [ :it | positions add: 'Cargo CONICET: ' , it ].
	^ positions asCommaString