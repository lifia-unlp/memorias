Class {
	#name : #Project,
	#superclass : #PeriodBoundedEntry,
	#instVars : [
		'title',
		'code',
		'director',
		'coDirector',
		'responsibleGroup',
		'fundingAgency',
		'amount',
		'summary',
		'website'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #testing }
Project class >> isVoyageRoot [
	^ true 
]

{ #category : #accessing }
Project >> amount [
	^ amount
]

{ #category : #accessing }
Project >> amount: anObject [
	amount := anObject
]

{ #category : #accessing }
Project >> coDirector [
	^ coDirector
]

{ #category : #accessing }
Project >> coDirector: anObject [
	coDirector := anObject
]

{ #category : #accessing }
Project >> code [
	^ code ifNil: [ code := '' ]
]

{ #category : #accessing }
Project >> code: anObject [
	code := anObject
]

{ #category : #accessing }
Project >> director [
	^ director
]

{ #category : #accessing }
Project >> director: anObject [
	director := anObject
]

{ #category : #accessing }
Project >> fundingAgency [
	^ fundingAgency
]

{ #category : #accessing }
Project >> fundingAgency: anObject [
	fundingAgency := anObject
]

{ #category : #testing }
Project >> isReferencedBy: anEntry [

	^ anEntry relatedProjects includes: self
]

{ #category : #utility }
Project >> propertyNames [
	^ {'title' . 'code' . 'startDate' . 'endDate' . 'director' . 'coDirector'.
	'responsibleGroup' . 'fundingAgency' . 'amount' . 'summary'. 'relatedLifians'. 'website'}
]

{ #category : #'double dispatch' }
Project >> renderAsNewsSubjectWith: aRenderer on: aCanvas [
	aRenderer renderProject: self on: aCanvas 
]

{ #category : #accessing }
Project >> responsibleGroup [
	^ responsibleGroup
]

{ #category : #accessing }
Project >> responsibleGroup: anObject [
	responsibleGroup := anObject
]

{ #category : #slugs }
Project >> suggestSlugBase [
	^self title, '-', self startDate year printString
]

{ #category : #accessing }
Project >> summary [
	^ summary
]

{ #category : #accessing }
Project >> summary: anObject [
	summary := anObject
]

{ #category : #accessing }
Project >> title [
	^ title
]

{ #category : #accessing }
Project >> title: anObject [
	title := anObject
]

{ #category : #accessing }
Project >> website [
	^ website
]

{ #category : #accessing }
Project >> website: anObject [
	website := anObject
]
