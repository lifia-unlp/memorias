Class {
	#name : #LifianEditorComponent,
	#superclass : #PluggableEditorComponent,
	#category : #'Lifiometro-Web-Editors'
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
LifianEditorComponent >> listOfPositionsAtCIC [

	| predefinedValues |
	predefinedValues := LifiometroRepository singleton
		                    persistentConfiguration positionsAtCIC.
	predefinedValues := predefinedValues copyWith: 'N/A'.
	^ (predefinedValues includes: (newValues at: 'positionAtCIC'))
		  ifTrue: [ predefinedValues ]
		  ifFalse: [
		  predefinedValues copyWith: (newValues at: 'positionAtCIC') ]
]

{ #category : #rendering }
LifianEditorComponent >> listOfPositionsAtCONICET [

	| predefinedValues |
	predefinedValues := LifiometroRepository singleton
		                    persistentConfiguration positionsAtCONICET.
	predefinedValues := predefinedValues copyWith: 'N/A'.
	^ (predefinedValues includes: (newValues at: 'positionAtCONICET'))
		  ifTrue: [ predefinedValues ]
		  ifFalse: [
		  predefinedValues copyWith: (newValues at: 'positionAtCONICET') ]
]

{ #category : #rendering }
LifianEditorComponent >> listOfPositionsAtUNLP [

	| predefinedValues |
	predefinedValues := LifiometroRepository singleton
		                    persistentConfiguration positionsAtUNLP.
	predefinedValues := predefinedValues copyWith: 'N/A'.
	^ (predefinedValues includes: (newValues at: 'positionAtUnlp'))
		  ifTrue: [ predefinedValues ]
		  ifFalse: [
		  predefinedValues copyWith: (newValues at: 'positionAtUnlp') ]
]

{ #category : #rendering }
LifianEditorComponent >> renderAffiliationsOn: html [

	self
		renderSelectionEditorFor: 'positionAtLIFIA'
		label: 'Función actual en el LIFIA'
		values:
			{ 'Investigador'. 'Personal de apoyo'. 'Estudiante de grado'.
			'Estudiante de posgrado'. 'Investigador externo'. 'Transferencista' }
		instructions: nil
		on: html.
	self
		renderSelectionEditorFor: 'positionAtUnlp'
		label: 'Cargo en UNLP'
		values: self listOfPositionsAtUNLP
		instructions: nil
		on: html.
	self
		renderSelectionEditorFor: 'positionAtCIC'
		label: 'Cargo en la CICPBA'
		values: self listOfPositionsAtCIC
		instructions: nil
		on: html.

	self
		renderSelectionEditorFor: 'positionAtCONICET'
		label: 'Cargo en la CONICET'
		values: self listOfPositionsAtCONICET
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'affiliations'
		label: 'Otras afiliaciones'
		instructions:
		'Indicar otras afiliaciones (No UNLP, CIC, CONICET).'
		on: html
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
		renderTextInputEditorFor: 'avatarUrl'
		label: 'URL de foto (o avatar)'
		instructions:
		'URL pública de una foto o avatar para incluir en el perfil. Idealmente de 120x120 px.'
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
		instructions:
		'de no concerla con exactitud, indique una fecha estimada'
		on: html.
	self
		renderDateInputEditorFor: 'endDate'
		label: 'Fecha de egreso'
		instructions: 'Deje vacío para miembros en funciones'
		on: html.
	self renderAffiliationsOn: html.
	self
		renderTextInputEditorFor: 'category'
		label: 'Categoria de incentivos'
		instructions: 'indique la fecha de obtención entre paréntesis'
		on: html.
	self
		renderTextInputEditorFor: 'sicadiCategory'
		label: 'Categoria en SICADI'
		instructions: 'indique la fecha de obtención entre paréntesis'
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
		renderTextInputEditorFor: 'shortCvInSpanish'
		label: 'CV resumido en español'
		instructions:
		'CV resumido como para incluir en proyectos o en el sitio web'
		on: html
]
