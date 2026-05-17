Class {
	#name : #ThesisReport,
	#superclass : #IndividualReport,
	#category : #'Lifiometro-Reports'
}

{ #category : #'instance creation' }
ThesisReport class >> thesis: theThesis publications: publications [
	^ self new
		thesis: theThesis;
		publications: publications;
		yourself
]

{ #category : #accessing }
ThesisReport >> projects [
	^thesis relatedProjects 
]

{ #category : #accessing }
ThesisReport >> publications: aCollection [ 
	publications := aCollection.
]

{ #category : #accessing }
ThesisReport >> relatedLifians [
	^ thesis relatedLifians 
]

{ #category : #accessing }
ThesisReport >> relatedProjects [
	^ thesis relatedProjects 
]

{ #category : #accessing }
ThesisReport >> researchers [
	^thesis relatedLifians 
]

{ #category : #accesing }
ThesisReport >> thesis: aThesis [ 
	thesis := aThesis
	
]
