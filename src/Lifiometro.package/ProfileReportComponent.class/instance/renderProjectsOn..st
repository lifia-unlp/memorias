rendering
renderProjectsOn: html
	html heading level2 with: 'Proyectos'.
	report projects do: [ :each | self renderProject: each on: html ]