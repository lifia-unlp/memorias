Class {
	#name : #PublicationReference,
	#superclass : #LifiaLogEntry,
	#instVars : [
		'selfArchivingUrl'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #converting }
PublicationReference >> asJsonLDWithWriter: aJsonLDWriter [
	^ self subclassResponsibility 
]

{ #category : #converting }
PublicationReference >> asReference [ 
	^ self subclassResponsibility 
]

{ #category : #converting }
PublicationReference >> asSummary [
	^ self asReference 
]

{ #category : #accessing }
PublicationReference >> selfArchivingUrl [ 
	^ selfArchivingUrl 
]

{ #category : #accessing }
PublicationReference >> selfArchivingUrl: aString [
	selfArchivingUrl := aString 
]
