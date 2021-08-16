rendering
renderActionsFor: each on: html
	self renderSelfArchivingUrlFor: each on: html.
	super renderActionsFor: each on: html.
	each class = BibtexReference
		ifTrue: [ html space.
			html tbsGlyphIcon iconCheck ].
