rendering-projects
renderProjectsReportOn: html
	projects
		ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'projects';
		with: 'Proyectos'.
	self report projects
		do: [ :each | self renderProject: each on: html ]