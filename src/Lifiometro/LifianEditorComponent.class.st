Class {
	#name : #LifianEditorComponent,
	#superclass : #PluggableEditorComponent,
	#category : #'Lifiometro-Web'
}

{ #category : #rendering }
LifianEditorComponent >> accept [
	[ (newValues at: 'startDate') asDate ]
		on: Error
		do: [ errors add: 'La fecha de inicio deben válida en formato dd/mm/aa' ].
	(newValues at: 'firstName')
		ifEmpty: [ errors add: 'El nombre es obligatorio' ].
	(newValues at: 'lastName')
		ifEmpty: [ errors add: 'El apellido es obligatorio' ].
	errors ifNotEmpty: [ ^ self ].
	super accept
]

{ #category : #rendering }
LifianEditorComponent >> renderPropertyEditorsOn: html [
	self
		renderTextInputEditorFor: 'firstName'
		label: 'Nombre'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'lastName'
		label: 'Apellido'
		instructions: nil
		on: html.
	self
		renderSelectionEditorFor: 'positionAtLIFIA'
		label: 'Función actual'
		values: {'Investigador' . 'Estudiante de grado' . 'Estudiante de posgrado'}
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'highestDegree'
		label: 'Grado máximo obtenido'
		instructions:
			'Indique título máximo (completo) obtenido, por ejemplo "Licenciado en Sistemas"'
		on: html.
	self
		renderDateInputEditorFor: 'startDate'
		label: 'Fecha de ingreso'
		instructions: 'de no concerla con exactitud, indique una fecha estimada'
		on: html.
	self
		renderDateInputEditorFor: 'endDate'
		label: 'Fecha de egreso'
		instructions: 'Deje vacío para miembros en funciones'
		on: html.
	self
		renderTextInputEditorFor: 'affiliations'
		label: 'Afiliaciones'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'positionAtUnlp'
		label: 'Cargo en UNLP'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'category'
		label: 'Categoria de incentivos'
		instructions: 'indique la fecha de obtención entre paréntesis'
		on: html.
	self
		renderTextInputEditorFor: 'positionAtCIC'
		label: 'Cargo en la CICPBA'
		instructions: 'deje vacío si no corresponde'
		on: html.
	self
		renderTextInputEditorFor: 'positionAtCONICET'
		label: 'Cargo en CONICET'
		instructions: 'deje vacío si no corresponde'
		on: html.
	self
		renderTextInputEditorFor: 'institutionalEmail'
		label: 'e-mail institucional'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'personalEmail'
		label: 'e-mail personal'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'phone'
		label: 'teléfono'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'orcid'
		label: 'ORCID'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'dblpProfile'
		label: 'URL en DBLP'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'googleResearchProfile'
		label: 'URL en Google Scholar'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'researchGateProfile'
		label: 'URL en Research Gate'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'webPage'
		label: 'Página web'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'coursesAtUNLP'
		label: 'Asignaturas de la UNLP en las que participa'
		instructions:
			'Separe con comas e indique entre paréntesis el nivel al que cada asignatura pertenece.'
		on: html.
	self
		renderTextInputEditorFor: 'shortCvInSpanish'
		label: 'CV resumido en español'
		instructions: 'CV resumido como para incluir en proyectos o en el sitio web'
		on: html.
	self
		renderTextInputEditorFor: 'shortCvInEnglish'
		label: 'CV resumido en inglés'
		instructions: 'CV resumido como para incluir en proyectos o en el sitio web'
		on: html.
	self
		renderTextInputEditorFor: 'interestsInSpanish'
		label: 'Intereses/temas en español'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'interestsInEnglish'
		label: 'Intereses/temas en inglés'
		instructions: nil
		on: html
]
