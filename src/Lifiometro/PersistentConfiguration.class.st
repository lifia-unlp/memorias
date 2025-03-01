Class {
	#name : #PersistentConfiguration,
	#superclass : #Object,
	#instVars : [
		'scholarshipTypes',
		'scholarshipFundingSources'
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
]

{ #category : #accessing }
PersistentConfiguration >> scholarshipFundingSources [

	^ scholarshipFundingSources
]

{ #category : #accessing }
PersistentConfiguration >> scholarshipFundingSources: anObject [

	scholarshipFundingSources := anObject
]

{ #category : #accessing }
PersistentConfiguration >> scholarshipTypes [

	^ scholarshipTypes
]

{ #category : #accessing }
PersistentConfiguration >> scholarshipTypes: anObject [

	scholarshipTypes := anObject
]
