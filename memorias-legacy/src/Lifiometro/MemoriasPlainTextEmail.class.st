Class {
	#name : #MemoriasPlainTextEmail,
	#superclass : #MemoriasEmail,
	#instVars : [
		'text'
	],
	#category : #'Lifiometro-Email'
}

{ #category : #private }
MemoriasPlainTextEmail >> asDictionary [

	^ super asDictionary
		  at: 'text' put: text;
		  yourself
]

{ #category : #private }
MemoriasPlainTextEmail >> asJson [

	^ self asDictionary asJson
]

{ #category : #private }
MemoriasPlainTextEmail >> asZnEntity [

	^ ZnEntity
				 with: self asJson 
				 type: ZnMimeType applicationJson
]

{ #category : #accessing }
MemoriasPlainTextEmail >> text [

	^ text
]

{ #category : #accessing }
MemoriasPlainTextEmail >> text: anObject [

	text := anObject
]
