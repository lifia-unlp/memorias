Class {
	#name : #ScheduleItemEditorComponent,
	#superclass : #TypedItemEditorComponent,
	#category : #'Lifiometro-Web-Editors'
}

{ #category : #'accept/cancel' }
ScheduleItemEditorComponent >> accept [
	[ (newValues at: 'startDate') asDate ]
		on: Error
		do: [ errors add: 'La fecha de inicio deben válida en formato dd/mm/aa' ].
	(newValues at: 'title')
		ifEmpty: [ errors add: 'El título es obligatorio' ].
	errors ifNotEmpty: [ ^ self ].
	super accept
]

{ #category : #'accept/cancel' }
ScheduleItemEditorComponent >> allowedTypes [
	^ Dictionary new
		at: 'scholarship' put: 'Becas';
		at: 'project' put: 'Financiación de proyectos';
		at: 'carrer' put: 'Carrera de investigador';
		at: 'travel' put: 'Viajes';
		at: 'events' put: 'Organización de eventos';
		at: 'other' put: 'Otros';
		yourself
]

{ #category : #'accept/cancel' }
ScheduleItemEditorComponent >> renderPropertyEditorsOn: html [
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
]
