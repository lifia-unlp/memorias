Class {
	#name : #DeletionConfirmer,
	#superclass : #TBSConfirmer,
	#instVars : [
		'entry'
	],
	#category : #'Lifiometro-Web'
}

{ #category : #accessing }
DeletionConfirmer >> entriesReferencing: anEntry [

	^LifiometroRepository singleton references
	, LifiometroRepository singleton projects
	, LifiometroRepository singleton thesis
	, LifiometroRepository singleton scholarships select: [ :each |
		entry isReferencedBy: each ]
]

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
			entry renderAsNewsSubjectWith: renderer on: canvas ] ].
	(self entriesReferencing: entry) do: [ :each |
		canvas tbsAlert
			beDanger;
			with: [
				canvas paragraph: [
						canvas strong:
								'Es mala idea. Esta entrada tiene se referencia desde otra:' ].
				canvas paragraph: [
						each renderAsNewsSubjectWith: renderer on: canvas ] ] ]
]
