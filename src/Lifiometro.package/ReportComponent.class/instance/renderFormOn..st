rendering-form
renderFormOn: html
	html
		tbsForm: [ html
				tbsRow: [ html tbsColumn: [ self renderYearSelectorsOn: html ] mediumSize: 4.
					html tbsColumn: [ self renderArticleTypeSelectorsOn: html ] mediumSize: 4.
					html tbsColumn: [ self renderActivitySelectorsOn: html ] mediumSize: 4 ].
			html
				tbsRow: [ html
						tbsColumn: [ html tbsButton
								beDefault;
								callback: [ self update ];
								beSmall;
								with: 'Filtrar' ]
						mediumSize: 4 ] ]