Class {
	#name : #PersistentConfiguration,
	#superclass : #Object,
	#instVars : [
		'scholarshipTypes',
		'scholarshipFundingSources',
		'positionsAtUNLP',
		'positionsAtCIC',
		'positionsAtCONICET'
	],
	#category : #'Lifiometro-Repository'
}

{ #category : #testing }
PersistentConfiguration class >> isVoyageRoot [ 
   ^true
]

{ #category : #initialization }
PersistentConfiguration >> initialize [

	scholarshipTypes := OrderedCollection new.
	scholarshipFundingSources := OrderedCollection new.
	positionsAtUNLP := OrderedCollection new.
	positionsAtCIC := OrderedCollection new.
	positionsAtCONICET := OrderedCollection new
]

{ #category : #accessing }
PersistentConfiguration >> positionsAtCIC [

	^ positionsAtCIC copy
]

{ #category : #accessing }
PersistentConfiguration >> positionsAtCIC: anObject [

	positionsAtCIC := anObject
]

{ #category : #accessing }
PersistentConfiguration >> positionsAtCONICET [

	^ positionsAtCONICET copy
]

{ #category : #accessing }
PersistentConfiguration >> positionsAtCONICET: anObject [

	positionsAtCONICET := anObject
]

{ #category : #accessing }
PersistentConfiguration >> positionsAtUNLP [

	^ positionsAtUNLP copy
]

{ #category : #accessing }
PersistentConfiguration >> positionsAtUNLP: anObject [

	positionsAtUNLP := anObject
]

{ #category : #accessing }
PersistentConfiguration >> scholarshipFundingSources [

	^ scholarshipFundingSources copy
]

{ #category : #accessing }
PersistentConfiguration >> scholarshipFundingSources: anObject [

	scholarshipFundingSources := anObject
]

{ #category : #accessing }
PersistentConfiguration >> scholarshipTypes [

	^ scholarshipTypes copy
]

{ #category : #accessing }
PersistentConfiguration >> scholarshipTypes: anObject [

	scholarshipTypes := anObject
]
