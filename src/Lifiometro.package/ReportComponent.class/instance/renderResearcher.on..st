rendering-researchers
renderResearcher: each on: html
	html
		tableRow: [ html
				tableData: each fullName;
				tableData: [ each startDate ifNotNil: [ :it | html text: it ddmmyyyy ] ];
				tableData: [ each endDate
						ifNotNil: [ :it | html text: it ddmmyyyy ]
						ifNil: [ html text: '-' ] ];
				tableData: [ html anchor
						target: '_blank';
						url: (self urlForResearcherProfile: each);
						with: 'Mas detalles' ] ]