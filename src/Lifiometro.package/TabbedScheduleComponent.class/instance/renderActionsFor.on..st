rendering
renderActionsFor: each on: html
	super renderActionsFor: each on: html.
	html space.
	html anchor
		callback: [ self duplicate: each ];
		title: 'Duplicar al próximo año';
		with: [ html tbsGlyphIcon iconForward ]