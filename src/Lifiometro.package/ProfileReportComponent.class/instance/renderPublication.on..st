rendering
renderPublication: each on: html
	^ html paragraph
		with: [ html text: each asSummary.
			each selfArchivingUrl
				ifNotNil: [ :url | 
					url
						ifNotEmpty: [ html space.
							html anchor
								url: url;
								target: '_new';
								with: [ html tbsGlyphIcon iconDownloadAlt ] ] ] ]