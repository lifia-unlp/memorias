Class {
	#name : #CheckboxListModel,
	#superclass : #Object,
	#instVars : [
		'heading',
		'checkboxModels'
	],
	#category : #'Lifiometro-Web-Components'
}

{ #category : #'instance creation' }
CheckboxListModel class >> heading: aHeading [

	^ self new
		  heading: aHeading;
		  yourself
]

{ #category : #adding }
CheckboxListModel >> addCheckboxFor: anId labeled: aLabel [

	| checkbox |
	checkbox := CheckboxModel id: anId label: aLabel.
	checkboxModels add: checkbox.
	^ checkbox
]

{ #category : #checking }
CheckboxListModel >> checkAll [

	checkboxModels do: [ :each | each beChecked ]
]

{ #category : #accessing }
CheckboxListModel >> checkboxModels [

	^ checkboxModels
]

{ #category : #accessing }
CheckboxListModel >> heading [

	^ heading
]

{ #category : #initialization }
CheckboxListModel >> heading: anObject [

	heading := anObject
]

{ #category : #initialization }
CheckboxListModel >> initialize [
	checkboxModels := OrderedCollection new.
]

{ #category : #checking }
CheckboxListModel >> uncheckAll [

	checkboxModels do: [ :each | each beUnchecked ]
]
