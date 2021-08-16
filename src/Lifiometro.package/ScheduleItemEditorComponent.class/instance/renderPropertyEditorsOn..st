accept/cancel
renderPropertyEditorsOn: html
	"startDate endDate title notes type moreInfoUrl"

	self
		renderTextInputEditorFor: 'title'
		label: 'Convocatoria'
		instructions: 'nombre descriptivo de este evento, convocatoria, o fecha importante'
		on: html.
	self renderTypeEditorLabeled: 'Tipo' instructions: nil on: html.
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
		renderTextInputEditorFor: 'moreInfoUrl'
		label: 'Mas información'
		instructions: 'Indique la URL o persona de contacto'
		on: html.
	self
		renderTextInputEditorFor: 'notes'
		label: 'notas'
		instructions: nil
		on: html.
	self
		renderCheckboxEditorFor: 'excludeFromReports'
		label: 'No reportar'
		instructions:
			'Marque esta casilla si este evento/convocatoria no debe incluirse en los reportes'
		on: html