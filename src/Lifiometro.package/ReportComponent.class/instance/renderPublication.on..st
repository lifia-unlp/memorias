rendering-publications
renderPublication: each on: html
	html text: each asReference.
	each selfArchivingUrl
		ifNotNil: [ :url | 
			url
				ifNotEmpty: [ html space.
					html anchor
						url: url;
						target: '_new';
						with: [ html tbsGlyphIcon iconDownloadAlt ] ] ]