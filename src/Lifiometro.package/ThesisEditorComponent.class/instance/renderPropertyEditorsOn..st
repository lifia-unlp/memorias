accept/cancel
renderPropertyEditorsOn: html
	self
		renderTextInputEditorFor: 'student'
		label: 'Alumno(s)'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'title'
		label: 'Título de la tesis/tesina/trabajo'
		instructions: nil
		on: html.
	self renderLevelEditorOn: html.
	self
		renderTextInputEditorFor: 'career'
		label: 'Carrera'
		instructions: nil
		on: html.
	self
		renderDateInputEditorFor: 'startDate'
		label: 'Fecha de inicio'
		instructions: nil
		on: html.
	self
		renderDateInputEditorFor: 'endDate'
		label: 'Fecha de fin'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'director'
		label: 'Director(es)'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'coDirector'
		label: 'Co-Director(es)'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'otherAdvisors'
		label: 'Asesores'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'summary'
		label: 'Resumen'
		instructions: nil
		on: html.
	self renderRelatedLifiansEditorOn: html.
	self renderRelatedProjectsEditorOn: html