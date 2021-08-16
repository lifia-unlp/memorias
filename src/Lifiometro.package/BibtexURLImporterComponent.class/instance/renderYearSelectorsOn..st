rendering
renderYearSelectorsOn: html
	html
		tbsForm: [ html label: 'Select years to review'.
			html div
				style: 'padding:10px;';
				with: [ importer years asSet sorted reversed
						do: [ :each | 
							html checkbox
								id: each;
								value: (yearSelectors at: each ifAbsentPut: false);
								callback: [ :value | yearSelectors at: each put: value ].
							html space.
							html
								text: each;
								text: ' (';
								text: (importer years occurrencesOf: each);
								text: ')';
								break ] ].
			html tbsButton
				beDefault;
				beSmall;
				with: 'Update' ]