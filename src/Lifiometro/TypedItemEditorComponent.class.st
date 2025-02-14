Class {
	#name : #TypedItemEditorComponent,
	#superclass : #PluggableEditorComponent,
	#instVars : [
		'newType'
	],
	#category : #'Lifiometro-Web-Editors'
}

{ #category : #'instance creation' }
TypedItemEditorComponent class >> item: anItem [
	^ self new
		item: anItem;
		yourself
]

{ #category : #'accept/cancel' }
TypedItemEditorComponent >> accept [
	item type: newType.
	super accept. 
]

{ #category : #rendering }
TypedItemEditorComponent >> allowedTypes [
	^ self subclassResponsibility
]

{ #category : #rendering }
TypedItemEditorComponent >> renderPropertyEditorsOn: html [
	| props |
	props := item propertyNames asOrderedCollection.
	(props includes: 'title')
		ifTrue: [ self renderInputEditorFor: 'title' on: html.
			props remove: 'title' ].
	self renderTypeEditorOn: html.
	props remove: 'type' ifAbsent: [  ].
	props do: [ :each | self renderInputEditorFor: each on: html ].
]

{ #category : #rendering }
TypedItemEditorComponent >> renderTypeEditorLabeled: label instructions: instructions on: html [
	html
		tbsFormGroup: [ html label
				for: 'type';
				with: (label ifNil: [ 'Type' ]).
			html break.
			html radioGroup
				callback: [ :value | newType := value ];
				selected: item type;
				with: [ :group | 
					(self allowedTypes associations
						asSortedCollection: [ :a :b | a value < b value ])
						do: [ :each | 
							group radioButton value: each key.
							html
								space;
								text: (self allowedTypes at: each key) , ' (' , each key , ')';
								break ] ] ]
]

{ #category : #rendering }
TypedItemEditorComponent >> renderTypeEditorOn: html [
	self renderTypeEditorLabeled: 'Type' instructions: nil on: html
]
