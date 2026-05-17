Class {
	#name : #LinkedDataConfiguration,
	#superclass : #Object,
	#instVars : [
		'organizationName',
		'organizationUrl',
		'dataUrl'
	],
	#category : #'Lifiometro-Linked-Data'
}

{ #category : #accessing }
LinkedDataConfiguration >> dataUrl [

	^ dataUrl
]

{ #category : #accessing }
LinkedDataConfiguration >> dataUrl: anObject [

	dataUrl := anObject
]

{ #category : #accessing }
LinkedDataConfiguration >> organizationName [

	^ organizationName
]

{ #category : #accessing }
LinkedDataConfiguration >> organizationName: anObject [

	organizationName := anObject
]

{ #category : #accessing }
LinkedDataConfiguration >> organizationUrl [

	^ organizationUrl
]

{ #category : #accessing }
LinkedDataConfiguration >> organizationUrl: anObject [

	organizationUrl := anObject
]
