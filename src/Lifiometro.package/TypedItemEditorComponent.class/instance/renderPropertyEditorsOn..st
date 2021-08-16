rendering
renderPropertyEditorsOn: html
	| props |
	props := item propertyNames asOrderedCollection.
	(props includes: 'title')
		ifTrue: [ self renderInputEditorFor: 'title' on: html.
			props remove: 'title' ].
	self renderTypeEditorOn: html.
	props remove: 'type' ifAbsent: [  ].
	props do: [ :each | self renderInputEditorFor: each on: html ].