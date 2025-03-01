Class {
	#name : #IndividualReport,
	#superclass : #Object,
	#instVars : [
		'publications',
		'projects',
		'scholarships',
		'thesis'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #accessing }
IndividualReport >> articlePublications [
	^ publications select: [ :each | each type = 'article' ]
]

{ #category : #accessing }
IndividualReport >> bookPublications [
	^ publications select: [ :each | each type = 'book' ]
]

{ #category : #accessing }
IndividualReport >> inbookPublications [
	^ publications select: [ :each | each type = 'inbook' ]
]

{ #category : #accessing }
IndividualReport >> inproceedingsPublications [
	^ publications select: [ :each | each type = 'inproceedings' ]
]

{ #category : #accessing }
IndividualReport >> otherPublications [

	^ publications reject: [ :each |
		  { 'article'. 'inproceedings'. 'inbook'. 'book' } includes:
			  each type ]
]

{ #category : #accessing }
IndividualReport >> publications [
	^ publications
]

{ #category : #accessing }
IndividualReport >> scholarships [
	^ scholarships
]

{ #category : #accessing }
IndividualReport >> thesis [
	^ thesis
]
