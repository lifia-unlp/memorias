rendering
renderSelfArchivingUrlFor: each on: html
	each selfArchivingUrl ifNil: [ ^ self ].
	each selfArchivingUrl ifEmpty: [ ^ self ].
	html space.
	html anchor
		url: each selfArchivingUrl;
		target: '_blank';
		with: '(PDF)'.
	html space