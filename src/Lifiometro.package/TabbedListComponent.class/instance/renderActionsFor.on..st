rendering
renderActionsFor: each on: html
	html anchor
		callback: [ self edit: each ];
		title: 'Editar esta entrada';
		with: [ html tbsGlyphIcon iconPencil ].
	html space.
	html anchor
		callback: [ self remove: each ];
		title: 'Archivar esta entrada';
		with: [ html tbsGlyphIcon iconTrash ]