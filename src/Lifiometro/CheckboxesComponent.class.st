Class {
	#name : #CheckboxesComponent,
	#superclass : #WAComponent,
	#instVars : [
		'checkboxListModels'
	],
	#category : #'Lifiometro-Web-Components'
}

{ #category : #building }
CheckboxesComponent >> addListWithHeading: aHeading [

	| list |
	list := CheckboxListModel heading: aHeading.
	checkboxListModels add: list.
	^ list
]

{ #category : #accessing }
CheckboxesComponent >> checkboxListModels [

	^ checkboxListModels
]

{ #category : #initialization }
CheckboxesComponent >> initialize [

	super initialize.
	checkboxListModels := OrderedCollection new
]

{ #category : #rendering }
CheckboxesComponent >> renderContentOn: html [

	| columnSize |
	columnSize := 12 // checkboxListModels size.
	html tbsForm: [
		html tbsRow: [
			checkboxListModels do: [ :each |
				html
					tbsColumn: [ self renderListModel: each on: html ]
					mediumSize: columnSize ] ].
		html tbsRow: [
			html
				tbsColumn: [
					html tbsButton
						beDefault;
						callback: [ self update ];
						beSmall;
						with: 'Filtrar' ]
				mediumSize: 4 ] ]
]

{ #category : #rendering }
CheckboxesComponent >> renderListModel: aCheckboxListModel on: html [

	html tbsFormGroup: [
		html
			label: aCheckboxListModel heading;
			break.
		aCheckboxListModel checkboxModels do: [ :each |
			html checkbox
				value: each checked;
				callback: [ :value | each checked: value ].
			html space.
			html text: each label.
			html break ] ]
]
