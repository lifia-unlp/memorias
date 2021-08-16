rendering input
renderRelatedProjectsEditorOn: html
	| currentValue |
	currentValue := newValues at: 'relatedProjects'.
	html
		tbsFormGroup: [ html label
				for: 'relatedProjects';
				with: 'Proyectos vinculados'.
			html
				break;
				small: 'Use control+click para seleccionar varios'.
			html multiSelect
				list: self projects;
				selected: currentValue;
				size: 10;
				class: 'form-control';
				labels: [ :project | 
					'(' , project startDate ddmmyyyy  , ' - '
						, project endDate ddmmyyyy  , ' ) ' , project title ];
				callback: [ :value | newValues at: 'relatedProjects' put: value ];
				with: currentValue;
				id: 'relatedProjects' ]