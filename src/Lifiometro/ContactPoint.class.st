Class {
	#name : #ContactPoint,
	#superclass : #Object,
	#instVars : [
		'type',
		'url'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #'as yet unclassified' }
ContactPoint class >> withType: aString andUrl: anotherString [
  ^ self new
		type: aString;
		url: anotherString;
		yourself.
]

{ #category : #accessing }
ContactPoint >> type [
	^ type
]

{ #category : #accessing }
ContactPoint >> type: aString [
	type := aString
]

{ #category : #accessing }
ContactPoint >> url [
	^ url
]

{ #category : #accessing }
ContactPoint >> url: aString [
	url := aString
]
