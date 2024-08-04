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
CheckboxesComponent >> renderAllNoneLinksFor: aCheckboxListModel on: html [

	| checkboxIds |
	checkboxIds := (aCheckboxListModel checkboxModels collect: #id) asJson.
	
	html anchor
		onClick: 'selectAll(', checkboxIds ,'); return false;';
		with: 'all'.
	html text: ' - '.
	html anchor
		onClick: 'selectNone(', checkboxIds ,'); return false;';
		with: 'none'
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
		self renderAllNoneLinksFor: aCheckboxListModel on: html.

		html break.
		aCheckboxListModel checkboxModels do: [ :each |
			html checkbox
				value: each checked;
				callback: [ :value | each checked: value ];
				id: each id.
			html space.
			html text: each label.
			html break ] ]
]

{ #category : #rendering }
CheckboxesComponent >> selectAllOrNoneJsFunctions [

	^ 'function selectAll(checkboxes) {
            checkboxes.forEach(function(id) {
                var checkbox = document.querySelector(''input[id="'' + id + ''"]'');
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        function selectNone(checkboxes) {
            checkboxes.forEach(function(id) {
                var checkbox = document.querySelector(''input[id="'' + id + ''"]'');
                if (checkbox) {
                    checkbox.checked = false;
                }
            });
        }'
]

{ #category : #rendering }
CheckboxesComponent >> updateRoot: aWARoot [

	super updateRoot: aWARoot.
	aWARoot addScript: self selectAllOrNoneJsFunctions
]
