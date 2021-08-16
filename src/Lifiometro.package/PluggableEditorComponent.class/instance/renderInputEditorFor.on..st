rendering input
renderInputEditorFor: property on: html
	(property asLowercase findString: 'date') > 0
		ifTrue: [ ^ self renderDateInputEditorFor: property on: html ].
	property = 'relatedLifians'
		ifTrue: [ ^ self renderRelatedLifiansEditorOn: html ].
	property = 'relatedProjects'
		ifTrue: [ ^ self renderRelatedProjectsEditorOn: html ].
	^ self renderTextInputEditorFor: property on: html