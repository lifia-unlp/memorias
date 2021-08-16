rendering
renderBibtexEntryOn: html
	html
		preformatted: [ html
				text: '@';
				text: bibtexEntry type;
				text: '{';
				text: bibtexEntry citationKey;
				text: ',';
				break.
			bibtexEntry tags
				do: [ :tag | 
					html space.
					html
						text: tag name;
						text: ' = {';
						text: tag value;
						text: '},';
						break ].
			html text: '}' ]