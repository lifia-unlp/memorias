rendering
renderItemsOn: html
	html heading
		level: 4;
		with: 'Estudiantes doctorales'.
	self renderItems: (groupingAndFilteringAdapter group: 'PhD') on: html.

	html heading
		level: 4;
		with: 'Estudiantes de maestría (tesis)'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'Masters')
		on: html.

	html heading
		level: 4;
		with: 'Estudiantes de especialización (trabajo final)'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'Specialization')
		on: html.

	html heading
		level: 4;
		with: 'Estudiantes de grado (tesina)'.
	self
		renderItems: (groupingAndFilteringAdapter group: 'Undergraduate')
		on: html