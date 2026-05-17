Class {
	#name : #MemoriasSession,
	#superclass : #WASession,
	#instVars : [
		'currentUser'
	],
	#category : 'Lifiometro-Web-Login'
}

{ #category : #accessing }
MemoriasSession >> currentUser [
	^ currentUser
]

{ #category : #accessing }
MemoriasSession >> currentUser: anObject [
	currentUser := anObject
]

{ #category : #testing }
MemoriasSession >> isAdmin [
	^ (self application preferenceAt: #adminEmail) trimBoth = currentUser email
]

{ #category : #testing }
MemoriasSession >> loginRequired [
	"true if loginApp prefference has been set, and the session has not been authenticated"

	^ currentUser isNil
]

{ #category : #testing }
MemoriasSession >> logout [
	currentUser := nil
]

{ #category : #accessing }
MemoriasSession >> remove: anObject [
	LifiometroRepository singleton
		remove: anObject
		onBehalfOf: currentUser
]

{ #category : #accessing }
MemoriasSession >> save: anObject [
	LifiometroRepository singleton save: anObject onBehalfOf: currentUser
]
