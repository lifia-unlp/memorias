rendering-publications
renderPublicationsIn: aCollection on: html
	aCollection
		do: [ :each | 
			html paragraph
				style: 'padding-left:5px;';
				with: [ self renderPublication: each on: html ] ]