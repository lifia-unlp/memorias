rendering
renderContentOn: html
	html
		heading: 'Potenciales autorias (' , guesser guesses size greaseString , ')'.
	html
		paragraph: [ html anchor
				callback: [ self answer ];
				with: [ html button: 'Volver' ] ].
	html
		unorderedList: [ (guesser guesses keys
				asSortedCollection: [ :a :b | a year asNumber > b year asNumber ])
				do: [ :reference | 
					| authors |
					authors := guesser guesses at: reference.
					html
						listItem: [ html anchor
								callback: [ self setAuthors: authors for: reference ];
								with: 'accept'.
							html space.
							html anchor
								callback: [ guesser ignore: reference ];
								with: 'ignore'.
							html space.
							html anchor
								callback: [ self edit: reference with: authors ];
								with: 'edit'.
							html space.
							html text: reference asSummary ].
					html
						unorderedList: [ authors do: [ :researcher | html listItem: researcher fullName ] ] ] ]