Class {
	#name : #ToDoEditorComponent,
	#superclass : #PluggableEditorComponent,
	#category : #'Lifiometro-Web-Editors'
}

{ #category : #rendering }
ToDoEditorComponent >> accept [

	(newValues at: 'requestor') ifNil: [
		errors add: 'Debe espedíficar un solicitante' ].
	(newValues at: 'assignee') ifNil: [
		errors add: 'Debe espedíficar un responsable' ].
	(newValues at: 'request') ifEmpty: [
		errors add: 'Debe especificar la solicitud' ].
	errors ifNotEmpty: [ ^ self ].
	super accept
]

{ #category : #rendering }
ToDoEditorComponent >> renderPropertyEditorsOn: html [

	| renderer |
	renderer := InternalNewsRenderer new.
	html tbsFormGroup: [
		html label with: 'Solicitud de cambio relativa a'.
		html paragraph: [
			item entry renderAsNewsSubjectWith: renderer on: html ] ].

	self
		renderComboSelectFor: 'requestor'
		from: { nil } , self lifians
		label: 'Solicitante'
		itemsLabelBlock: [ :each |
		each ifNotNil: [ each formalName ] ifNil: [ '' ] ]
		instructions: 'Seleccione al solicitante'
		on: html.
	self
		renderComboSelectFor: 'assignee'
		from: { nil } , self lifians
		label: 'Responsable'
		itemsLabelBlock: [ :each |
		each ifNotNil: [ each formalName ] ifNil: [ '' ] ]
		instructions: 'Seleccione al responsable'
		on: html.
	self
		renderDateInputEditorFor: 'deadline'
		label: 'Fecha límite'
		instructions: nil
		on: html.
	self
		renderTextInputEditorFor: 'request'
		label: 'Detalle su solicitud'
		instructions: nil
		on: html.
	self renderStatusEditorOn: html
]

{ #category : #rendering }
ToDoEditorComponent >> renderStatusEditorOn: html [

	html tbsFormGroup: [
		html label
			for: 'isCompleted';
			with: 'Estado'.
		html break.
		html radioGroup
			callback: [ :value | newValues at: 'isCompleted' put: value ];
			selected: (newValues at: 'isCompleted');
			with: [ :group |
				{
					(true -> 'Completado').
					(false -> 'Pendiente') } do: [ :each |
						group radioButton value: each key.
						html
							space;
							text: each value;
							break ] ] ]
]
