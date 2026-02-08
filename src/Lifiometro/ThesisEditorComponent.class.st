Class {
	#name : #ThesisEditorComponent,
	#superclass : #PluggableEditorComponent,
	#category : #'Lifiometro-Web-Editors'
}

{ #category : #'accept/cancel' }
ThesisEditorComponent >> accept [

	[ (newValues at: 'startDate') asDate ]
		on: Error
		do: [
		errors add: 'La fecha de inicio deben válida en formato dd/mm/aa' ].
	(newValues at: 'title') ifEmpty: [
		errors add: 'Debe espedíficar un título' ].
	(newValues at: 'student') ifEmpty: [
		errors add: 'Debe especifica rel nombre del alumno' ].
	(newValues at: 'director') ifEmpty: [
		errors add: 'Debe especificar el nombre del director' ].
	(newValues at: 'career') ifEmpty: [
		errors add: 'Debe especificar la carrera' ].
	(newValues at: 'level') ifEmpty: [
		errors add: 'Debe especificar el nivel' ].
	self reportPotentialDuplicates.
	errors ifNotEmpty: [ ^ self ].
	super accept
]

{ #category : #'accept/cancel' }
ThesisEditorComponent >> renderPropertyEditorsOn: html [
	self
		renderTextInputEditorFor: 'student'
		label: 'Alumno(s)'
		instructions: 'Ingrese nombre y apellido. Si son varios, separelos con coma y con "y" en el último.'
		on: html.
	self
		renderTextInputEditorFor: 'title'
		label: 'Título de la tesis/tesina/trabajo'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'keywords'
		label: 'Keywords (separadas con coma)'
		instructions: nil
		on: html.
	self
		renderSelectionEditorFor: 'level'
		label: 'Nivel'
		values: {'Undergraduate' . 'Specialization' . 'Masters' . 'PhD'}
		instructions: nil
		on: html.
	self
		renderSelectionEditorFor: 'progress'
		label: 'Grado de avance'
		values: {'0%' . '25%' . '50%' . '75%' . '90%' . '100%'}
		instructions: 'Si el grado de avance es 90% solo faltaría defender'
		on: html.
	self
		renderTextInputEditorFor: 'career'
		label: 'Carrera'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'selfArchivingUrl'
		label: 'URL de auto-archivado (reporte final)'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'website'
		label: 'Sitio web'
		instructions: 'Utilizar en caso de que exista un sitio web para el seguimiento del trabajo'
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
		instructions: 'Ingrese nombre y apellido. Si son varios, separelos con coma y con "y" en el último.'
		on: html.
	self
		renderTextInputEditorFor: 'coDirector'
		label: 'Co-Director(es)'
		instructions: 'Ingrese nombre y apellido. Si son varios, separelos con coma y con "y" en el último.'
		on: html.
	self
		renderTextInputEditorFor: 'otherAdvisors'
		label: 'Asesores'
		instructions: 'Ingrese nombre y apellido. Si son varios, separelos con coma y con "y" en el último.'
		on: html.
	self
		renderTextInputEditorFor: 'summary'
		label: 'Resumen'
		instructions: nil
		on: html.
	self renderRelatedLifiansEditorOn: html.
	self renderRelatedProjectsEditorOn: html
]

{ #category : #'accept/cancel' }
ThesisEditorComponent >> reportPotentialDuplicates [

	| finder potentialDuplicates |
	finder := DuplicateFinder new.
	potentialDuplicates := finder
		                       findPotentialDuplicatesIn:
		                       (self thesis copyWithout: item)
		                       forThesisTitled:
		                       (newValues at: 'title' ifAbsentPut: '').

	potentialDuplicates ifEmpty: [ ^ self ].
	errors add: (String streamContents: [ :strm |
			 strm nextPutAll: 'Ya existen tesis con titulos casi igual a ese (temo que esto sea un duplicado): '.
			 potentialDuplicates
				 do: [ :each |
					 strm
						 nextPutAll: '"';
						 nextPutAll: each title;
						 nextPutAll: '"' ]
				 separatedBy: [ strm space ] ])
]
