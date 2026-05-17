Class {
	#name : #StringCollectionEditorComponent,
	#superclass : #WAComponent,
	#instVars : [
		'strings',
		'title',
		'comment',
		'string'
	],
	#category : #'Lifiometro-Web'
}

{ #category : #initialize }
StringCollectionEditorComponent class >> strings: theStrings title: aTitle comment: aComment [

	^ self new
		  strings: theStrings title: aTitle comment: aComment;
		  yourself
]

{ #category : #callbacks }
StringCollectionEditorComponent >> accept [

	self answer: strings asOrderedCollection
]

{ #category : #callbacks }
StringCollectionEditorComponent >> cancel [
	self answer: nil.
]

{ #category : #initialization }
StringCollectionEditorComponent >> initialize [

	super initialize.
	strings := OrderedCollection new.
]

{ #category : #initialize }
StringCollectionEditorComponent >> renderAcceptCancelFormOn: html [

	^ html tbsForm: [
		  html break.
		  html paragraph: [
			  html tbsButton
				  beDefault;
				  callback: [ self cancel ];
				  with: 'Cancel'.
			  html space.
			  html tbsButton
				  bePrimary;
				  callback: [ self accept ];
				  with: 'Accept' ] ]
]

{ #category : #initialize }
StringCollectionEditorComponent >> renderAddNewStringFormOn: html [

	html tbsForm: [
		html tbsFormGroup: [
			html textInput
				callback: [ :value | string := value ];
				with: '';
				id: 'string'.
			html space.
			html tbsButton
				callback: [ string ifNotEmpty: [ strings add: string trimBoth ] ];
				with: 'Add' ] ]
]

{ #category : #initialize }
StringCollectionEditorComponent >> renderContentOn: html [

	html tbsPanel: [
		html tbsPanelBody: [
			html heading
				level4;
				with: title.
			html paragraph: comment.
			self renderStringsOn: html.
			self renderAddNewStringFormOn: html.
			self renderAcceptCancelFormOn: html ] ]
]

{ #category : #initialize }
StringCollectionEditorComponent >> renderStringsOn: html [

	html unorderedList: [
		strings sorted do: [ :each |
			html listItem: [
				html text: each.
				html space.
				html anchor
					callback: [ strings remove: each ];
					with: 'X' ] ] ]
]

{ #category : #initialize }
StringCollectionEditorComponent >> strings: theStrings title: aTitle comment: aComment [

	strings := theStrings asSet.
	title := aTitle.
	comment := aComment
]
