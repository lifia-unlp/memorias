rendering
renderPropertyEditorsOn: html
	"startDate endDate title director coDirector student fundingAgency type summary"

	self
		renderTextInputEditorFor: 'student'
		label: 'Becario'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'title'
		label: 'Título/tema de trabajo'
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
		renderTextInputEditorFor: 'type'
		label: 'Tipo de beca'
		instructions:
			'doctoral, experiencia laboral, entrenamiento, iniciación, estímulo, post-doctoral, pasantía, etc.'
		on: html.
	self
		renderTextInputEditorFor: 'fundingAgency'
		label: 'Fuente de financiación'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'summary'
		label: 'Resumen'
		instructions: nil
		on: html.
	self renderRelatedLifiansEditorOn: html.
	self renderRelatedProjectsEditorOn:  html