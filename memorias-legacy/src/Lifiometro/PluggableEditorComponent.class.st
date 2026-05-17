Class {
	#name : #PluggableEditorComponent,
	#superclass : #WAComponent,
	#instVars : [
		'item',
		'newValues',
		'errors'
	],
	#category : #'Lifiometro-Web-Editors'
}

{ #category : #'instance creation' }
PluggableEditorComponent class >> item: aProject [
	^ self new
		item: aProject;
		yourself
]

{ #category : #'accept/cancel' }
PluggableEditorComponent >> accept [
	newValues associations do: [ :ass | item at: ass key put: ass value ].
	self answer: item
]

{ #category : #'accept/cancel' }
PluggableEditorComponent >> cancel [
	self answer: nil
]

{ #category : #initialization }
PluggableEditorComponent >> initialize [
	super initialize.
	newValues := Dictionary new.
	errors := OrderedCollection new.
]

{ #category : #accessing }
PluggableEditorComponent >> item: anItemWithProperties [
	item := anItemWithProperties.
	item propertyNames
		do: [ :each | newValues at: each put: ((item at: each) ifNil: [ '' ]) ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> labelForThesis: thesis [

	|  timeFrameLabel |
	timeFrameLabel := thesis ageInYears < 5
		                  ifTrue: [ 'últimos 5 años' ]
		                  ifFalse: [ 'iniciada anteriormente' ].

	^ ' (' , thesis level , ', ' , timeFrameLabel , ') ' , thesis student
	  , '. ' , thesis title
]

{ #category : #accessing }
PluggableEditorComponent >> lifians [

	^ LifiometroRepository singleton lifians asSortedCollection: [ :a :b |
		  a fullName < b fullName ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> obtainDateValueFromString: aString [
	| newDate |
	aString ifEmpty: [ ^ nil ].
	[ newDate := (DateParser
		readingFrom: aString readStream
		pattern: 'd/m/y') parse ]
		on: Error
		do: [ errors add: 'Debe ser una fecha valida en formato dd/mm/aaaa.'.
			^ nil ].
	^ newDate asDate
]

{ #category : #accessing }
PluggableEditorComponent >> projects [
	^ LifiometroRepository singleton projects
		asSortedCollection: [ :a :b | a endDate > b endDate ]
]

{ #category : #accessing }
PluggableEditorComponent >> references [

	^ LifiometroRepository singleton references
]

{ #category : #rendering }
PluggableEditorComponent >> renderButtonsOn: html [
	html
		paragraph: [ html tbsButton
				beDefault;
				callback: [ self cancel ];
				with: 'Cancel'.
			html space.
			html tbsButton
				bePrimary;
				callback: [ self accept ];
				with: 'Accept' ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderCheckboxEditorFor: property label: label instructions: instructions on: html [
	| currentValue |
	currentValue := (newValues at: property) ifNil: [ false ].
	html
		tbsFormGroup: [ html label
				for: property;
				with: label.
			html break.
			html checkbox
				callback: [ :value | newValues at: property put: value ];
				value: currentValue;
				id: property.
			html break.
			self renderEditorInstructions: instructions on: html ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderComboSelectFor: property from: items label: aLabel itemsLabelBlock: aBlock instructions: instructions on: html [

	| currentValue |
	currentValue := newValues at: property.
	html tbsFormGroup: [
		html label
			for: property;
			with: aLabel.
		html
			break;
			small: instructions.
		html select
			list: items;
			selected: currentValue;
			class: 'form-control';
			labels: aBlock;
			callback: [ :value | newValues at: property put: value ];
			with: currentValue;
			id: property ]
]

{ #category : #rendering }
PluggableEditorComponent >> renderContentOn: html [
	html
		tbsPanel: [ html
				tbsPanelBody: [ self renderLastUpdatedInfoOn: html.
					html
						tbsForm: [ self renderPropertyEditorsOn: html.
							errors
								ifNotEmpty: [ errors
										do: [ :each | 
											html tbsAlert
												beDanger;
												with: each ].
									errors := OrderedCollection new ].
							self renderButtonsOn: html ] ] ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderDateInputEditorFor: property label: aLabel instructions: instructions on: html [
	| currentValue |
	currentValue := newValues at: property.
	html
		tbsFormGroup: [ html label
				for: property;
				with: aLabel.
			html break.
			html textInput
				noAutocomplete;
				class: 'form-control';
				placeholder: 'dd/mm/aaaa';
				value:
					(currentValue
						ifNil: [ '' ]
						ifNotNil: [ :it | 
							[ it asDate ddmmyyyy ]
								on: Error
								do: [ '' ] ]);
				callback:
						[ :value | newValues at: property put: (self obtainDateValueFromString: value) ];
				id: property;
				script:
					(html jQuery new datepicker
						dateFormat: 'dd/mm/yy';
						onSelect: html jQuery ajax serializeThis).
			self renderEditorInstructions: instructions on: html ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderDateInputEditorFor: property on: html [
	self
		renderDateInputEditorFor: property
		label: property asCapitalizedPhrase
		instructions: nil
		on: html
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderEditorInstructions: instructions on: html [
	^ instructions
		ifNotNil: [ html small 
				class: 'form-text text-muted';
				with: instructions ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderInputEditorFor: property on: html [
	(property asLowercase findString: 'date') > 0
		ifTrue: [ ^ self renderDateInputEditorFor: property on: html ].
	property = 'relatedLifians'
		ifTrue: [ ^ self renderRelatedLifiansEditorOn: html ].
	property = 'relatedProjects'
		ifTrue: [ ^ self renderRelatedProjectsEditorOn: html ].
	property = 'relatedThesis'
		ifTrue: [ ^ self renderRelatedThesisEditorOn: html ].
	^ self renderTextInputEditorFor: property on: html
]

{ #category : #rendering }
PluggableEditorComponent >> renderLastUpdatedInfoOn: html [
	item lastEditedOn
		ifNotNil: [ :date | 
			html
				paragraph:
					'Actualizado por ' , item lastEditedBy email , ' el '
						, date asDate ddmmyyyy , ' a las ' , date asTime hhmm24 ]
]

{ #category : #rendering }
PluggableEditorComponent >> renderPropertyEditorsOn: html [
	item propertyNames 
		do: [ :each | self renderInputEditorFor: each on: html ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderRelatedLifiansEditorOn: html [
	| currentValue |
	currentValue := newValues at: 'relatedLifians'.
	html
		tbsFormGroup: [ html label
				for: 'relatedLifians';
				with: 'Investigadores involucrados'.
			html
				break;
				small: 'Use control+click para seleccionar varios'.
			html multiSelect
				list: self lifians;
				selected: currentValue;
				size: 10;
				class: 'form-control';
				labels: [ :lifian | lifian fullName ];
				callback: [ :value | newValues at: 'relatedLifians' put: value ];
				with: currentValue;
				id: 'relatedLifians' ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderRelatedProjectsEditorOn: html [
	| currentValue |
	currentValue := newValues at: 'relatedProjects'.
	html
		tbsFormGroup: [ html label
				for: 'relatedProjects';
				with: 'Proyectos vinculados'.
			html
				break;
				small: 'Use control+click para seleccionar varios'.
			html multiSelect
				list: self projects;
				selected: currentValue;
				size: 10;
				class: 'form-control';
				labels: [ :project | 
					'(' , project startDate ddmmyyyy , ' - ' , project endDate ddmmyyyy
						, ' - ' , (project director ifNil: [ '' ]) , ' ) '
						, project title ];
				callback: [ :value | newValues at: 'relatedProjects' put: value ];
				with: currentValue;
				id: 'relatedProjects' ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderRelatedThesisEditorOn: html [

	| currentValue |
	currentValue := newValues at: 'relatedThesis'.
	html tbsFormGroup: [
		html label
			for: 'relatedThesis';
			with: 'Tesis/tesinas vinculadas'.
		html
			break;
			small: 'Use control+click para seleccionar varios'.
		html multiSelect
			list: self thesis;
			selected: currentValue;
			size: 10;
			class: 'form-control';
			labels: [ :thesis | self labelForThesis: thesis ];
			callback: [ :value | newValues at: 'relatedThesis' put: value ];
			with: currentValue;
			id: 'relatedThesis' ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderSelectionEditorFor: property label: label values: aCollectionOfValues instructions: instructions on: html [

	html tbsFormGroup: [
		html label
			for: property;
			with: label.
		html break.
		instructions ifNotNilNotEmpty: [
			self renderEditorInstructions: instructions on: html.
			html break ].
		html radioGroup
			callback: [ :value | newValues at: property put: value ];
			selected: (newValues at: property);
			with: [ :group |
				aCollectionOfValues do: [ :each |
						group radioButton value: each.
						html
							space;
							text: each;
							break ] ] ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderTextInputEditorFor: property label: label instructions: instructions on: html [
	| currentValue |
	currentValue := (newValues at: property) ifNil: [ '' ].
	html
		tbsFormGroup: [ html label
				for: property;
				with: label.
			(currentValue size > 80
				ifTrue: [ html textArea
						rows: 3;
						yourself ]
				ifFalse: [ html textInput ])
				tbsFormControl;
				callback: [ :value | newValues at: property put: value ];
				with: currentValue;
				id: property.
			self renderEditorInstructions: instructions on: html ]
]

{ #category : #'rendering input' }
PluggableEditorComponent >> renderTextInputEditorFor: property on: html [
	| currentValue |
	currentValue := newValues at: property.
	html
		tbsFormGroup: [ html label
				for: property;
				with: property asCapitalizedPhrase.
			(currentValue size > 80
				ifTrue: [ html textArea
						rows: 3;
						yourself ]
				ifFalse: [ html textInput ])
				tbsFormControl;
				callback: [ :value | newValues at: property put: value ];
				with: currentValue;
				id: property ]
]

{ #category : #accessing }
PluggableEditorComponent >> scholarships [

	^ LifiometroRepository singleton scholarships
]

{ #category : #accessing }
PluggableEditorComponent >> thesis [

	^ LifiometroRepository singleton thesis asSortedCollection: [ :a :b |
		  a level < b level or: [
			  a level = b level and: [
				  a startDate year > b startDate year or: [
					  a startDate year = b startDate year and: [
						  a student < b student ] ] ] ] ]
]

{ #category : #rendering }
PluggableEditorComponent >> updateRoot: aWARoot [
	super updateRoot: aWARoot.
	JQBaseTheme default updateRoot: aWARoot
]
