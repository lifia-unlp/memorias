Class {
	#name : #CheckboxModel,
	#superclass : #Object,
	#instVars : [
		'label',
		'id',
		'checked'
	],
	#category : #'Lifiometro-Web-Components'
}

{ #category : #'instance creation' }
CheckboxModel class >> id: anId label: aLabel [

	^ self new
		  id: anId label: aLabel;
		  yourself
]

{ #category : #accessing }
CheckboxModel >> beChecked [

	checked := true
]

{ #category : #accessing }
CheckboxModel >> beUnchecked [

	checked := false
]

{ #category : #accessing }
CheckboxModel >> checked [

	^ checked
]

{ #category : #accessing }
CheckboxModel >> checked: anObject [

	checked := anObject
]

{ #category : #accessing }
CheckboxModel >> id [

	^ id
]

{ #category : #initialization }
CheckboxModel >> id: anId label: aLabel [

	id := anId.
	label := aLabel
]

{ #category : #initialization }
CheckboxModel >> initialize [

	checked := false
]

{ #category : #accessing }
CheckboxModel >> label [

	^ label
]

{ #category : #accessing }
CheckboxModel >> toggle [

	checked := checked not
]
