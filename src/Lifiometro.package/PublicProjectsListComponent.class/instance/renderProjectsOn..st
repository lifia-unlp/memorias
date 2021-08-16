initialization
renderProjectsOn: html
	html heading: 'Projectos de investigación'.
	html heading level2 with: 'Proyectos en curso'.
	activeProjects do: [ :each | self renderProject: each on: html ].
	html heading level2 with: 'Proyectos finalizados'.
	finishedProjects do: [ :each | self renderProject: each on: html ]