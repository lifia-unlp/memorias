Class {
	#name : #ScholarshipEditorComponent,
	#superclass : #PluggableEditorComponent,
	#category : #'Lifiometro-Web-Editors'
}

{ #category : #'accept/cancel' }
ScholarshipEditorComponent >> accept [
	[ (newValues at: 'startDate') asDate ]
		on: Error
		do: [ errors add: 'La fecha de inicio deben válida en formato dd/mm/aa' ].
	[ (newValues at: 'endDate') asDate ]
		on: Error
		do: [ errors add: 'La fecha de fin deben válida en formato dd/mm/aa' ].
	(newValues at: 'title')
		ifEmpty: [ errors add: 'El título es obligatorio' ].
	(newValues at: 'student')
		ifEmpty: [ errors add: 'El nombre del alumno es obligatorio' ].
	(newValues at: 'director')
		ifEmpty: [ errors add: 'El nombre del director es obligatorio' ].
	errors ifNotEmpty: [ ^ self ].
	super accept
]

{ #category : #rendering }
ScholarshipEditorComponent >> listOfValidScholarshipFundingSources [

	| predefinedValues |
	predefinedValues := LifiometroRepository singleton
		                    persistenConfiguration scholarshipFundingSources.
	^ (predefinedValues includes: (newValues at: 'fundingAgency'))
		  ifTrue: [ predefinedValues ]
		  ifFalse: [
		  predefinedValues copyWith: (newValues at: 'fundingAgency') ]
]

{ #category : #rendering }
ScholarshipEditorComponent >> listOfValidScholarshipTypes [

	| predefinedValues |
	predefinedValues := LifiometroRepository singleton
		                    persistenConfiguration scholarshipTypes.
	^ (predefinedValues includes: (newValues at: 'type'))
		  ifTrue: [ predefinedValues ]
		  ifFalse: [ predefinedValues copyWith: (newValues at: 'type') ]
]

{ #category : #rendering }
ScholarshipEditorComponent >> renderPropertyEditorsOn: html [
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
		renderSelectionEditorFor: 'type'
		label: 'Tipo'
		values: self listOfValidScholarshipTypes
		instructions:
		'Indique de qué tipo de beca o estancia se trata'
		on: html.

	self
		renderSelectionEditorFor: 'fundingAgency'
		label: 'Fuente de financiación'
		values: self listOfValidScholarshipFundingSources
		instructions:
		'Indique la fuende de financiación.'
		on: html.
	self
		renderTextInputEditorFor: 'summary'
		label: 'Resumen'
		instructions: nil
		on: html.
	self renderRelatedLifiansEditorOn: html.
	self renderRelatedProjectsEditorOn: html
]
