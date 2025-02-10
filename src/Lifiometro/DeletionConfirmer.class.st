Class {
	#name : #DeletionConfirmer,
	#superclass : #TBSConfirmer,
	#instVars : [
		'entry'
	],
	#category : #'Lifiometro-Web'
}

{ #category : #accessing }
DeletionConfirmer >> entry [

	^ entry
]

{ #category : #accessing }
DeletionConfirmer >> entry: anObject [

	entry := anObject
]

{ #category : #rendering }
DeletionConfirmer >> renderContentOn: aCanvas [
	aCanvas tbsContainer: [ super renderContentOn: aCanvas ]
]

{ #category : #rendering }
DeletionConfirmer >> renderMessageOn: canvas [

	| tag renderer |
	renderer := InternalNewsRenderer new.
	tag := canvas tbsAlert.
	tag style: 'margin-top: 30px;'.
	tag beWarning.
	tag with: [
		canvas paragraph: [
			canvas strong:
				'¿Esta seguro de querer eliminar la siguiente entrada?' ].
		canvas paragraph: [
			entry renderAsNewsSubjectWith: renderer on: canvas ] ]
]
