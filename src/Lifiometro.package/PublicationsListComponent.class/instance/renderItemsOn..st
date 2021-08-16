rendering
renderItemsOn: html
	html heading
		level: 4;
		with: 'Artículos en revistas'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'article')
		on: html.
	html heading
		level: 4;
		with: 'Artículos en conferencias'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'inproceedings')
		on: html.
	html heading
		level: 4;
		with: 'Capítulos de libros'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'inbook')
		on: html.
	html heading
		level: 4;
		with: 'Libros'.
	^ self
		renderItems: (groupingAndFilteringAdapter group: 'book')
		on: html