rendering
renderRelatedProjectsFor: each on: html
	html break.
	html
		text:
			'Proyectos: '
				,
					((each relatedProjects ifNil: [ Set new ])
						collect: [ :project | project title ]) asCommaString