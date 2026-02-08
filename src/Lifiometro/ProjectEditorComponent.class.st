Class {
	#name : #ProjectEditorComponent,
	#superclass : #PluggableEditorComponent,
	#instVars : [
		'newType'
	],
	#category : #'Lifiometro-Web-Editors'
}

{ #category : #callbacks }
ProjectEditorComponent >> accept [

	[ (newValues at: 'startDate') asDate ]
		on: Error
		do: [
		errors add: 'La fecha de inicio deben válida en formato dd/mm/aa' ].
	[ (newValues at: 'endDate') asDate ]
		on: Error
		do: [
		errors add: 'La fecha de fin deben válida en formato dd/mm/aa' ].
	(newValues at: 'title') ifEmpty: [
		errors add: 'El título es obligatorio' ].
	self reportPotentialDuplicates.
	errors ifNotEmpty: [ ^ self ].
	super accept
]

{ #category : #rendering }
ProjectEditorComponent >> renderPropertyEditorsOn: html [
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
	self
		renderTextInputEditorFor: 'website'
		label: 'Sitio Web'
		instructions: nil
		on: html.		
	self renderRelatedLifiansEditorOn: html
]

{ #category : #rendering }
ProjectEditorComponent >> reportPotentialDuplicates [

	| finder potentialDuplicates startYear |
	finder := DuplicateFinder new.
	startYear := ([ (newValues at: 'startDate') asDate ]
		              on: Error
		              do: [ Date today ]) year.
	potentialDuplicates := finder
		                       findPotentialDuplicatesIn:
		                       (self projects copyWithout: item)
		                       forProjectTitled:
		                       (newValues at: 'title' ifAbsentPut: '')
		                       startingOnYear: startYear.

	potentialDuplicates ifEmpty: [ ^ self ].
	errors add: (String streamContents: [ :strm |
			 strm nextPutAll:
				 'Ya existen proyectos con ese título o casi idéntico iniciando el mismo año (temo que esto sea un duplicado): '.
			 potentialDuplicates
				 do: [ :each |
					 strm
						 nextPutAll: '"';
						 nextPutAll: each title;
						 nextPutAll: ' (';
						 nextPutAll: each startDate year greaseString;
						 nextPutAll: ')"' ]
				 separatedBy: [ strm space ] ])
]
