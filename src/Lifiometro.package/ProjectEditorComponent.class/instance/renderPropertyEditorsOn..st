rendering
renderPropertyEditorsOn: html
	"
startDate endDate title code director coDirector responsibleGroup fundingAgency amount summary"

	self
		renderTextInputEditorFor: 'title'
		label: 'Título del proyecto'
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
		renderTextInputEditorFor: 'code'
		label: 'Código'
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
		renderTextInputEditorFor: 'responsibleGroup'
		label: 'Grupo responsable'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'fundingAgency'
		label: 'Fuente de financiación'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'amount'
		label: 'Monto'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'summary'
		label: 'Resumen'
		instructions: nil
		on: html.
	self renderRelatedLifiansEditorOn: html