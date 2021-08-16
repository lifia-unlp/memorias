rendering-researchers
renderResearchersOn: html
	projects
		ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'researchers';
		with: 'Investigadores'.
	html
		tbsTable: [ html
				tableHead: [ html
						tableHeading: 'Nombre';
						tableHeading: 'Ingreso';
						tableHeading: 'Egreso';
						tableHeading: 'Memoria técnica' ].
			html
				tableBody: [ (report researchers
						asSortedCollection: [ :a :b | a fullName < b fullName ])
						do: [ :each | self renderResearcher: each on: html ] ] ]