Class {
	#name : #Scholarship,
	#superclass : #PeriodBoundedEntry,
	#instVars : [
		'title',
		'director',
		'coDirector',
		'student',
		'fundingAgency',
		'type',
		'summary'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #testing }
Scholarship class >> isVoyageRoot [
	^ true 
]

{ #category : #accessing }
Scholarship >> coDirector [
	^ coDirector
]

{ #category : #accessing }
Scholarship >> coDirector: anObject [
	coDirector := anObject
]

{ #category : #accessing }
Scholarship >> director [
	^ director
]

{ #category : #accessing }
Scholarship >> director: anObject [
	director := anObject
]

{ #category : #accessing }
Scholarship >> fundingAgency [
	^ fundingAgency
]

{ #category : #accessing }
Scholarship >> fundingAgency: anObject [
	fundingAgency := anObject
]

{ #category : #accessing }
Scholarship >> propertyNames [
	^ {'title' . 'student' . 'type' . 'startDate' . 'endDate' . 'director'.
	'coDirector' . 'fundingAgency' . 'summary' . 'relatedLifians'.
	'relatedProjects'}
]

{ #category : #'double dispatch' }
Scholarship >> renderAsNewsSubjectWith: aRenderer on: aCanvas [
	aRenderer renderScholarship: self on: aCanvas 
]

{ #category : #accessing }
Scholarship >> student [
	^ student
]

{ #category : #accessing }
Scholarship >> student: anObject [
	student := anObject
]

{ #category : #accessing }
Scholarship >> summary [
	^ summary
]

{ #category : #accessing }
Scholarship >> summary: anObject [
	summary := anObject
]

{ #category : #accessing }
Scholarship >> title [
	^ title
]

{ #category : #accessing }
Scholarship >> title: anObject [
	title := anObject
]

{ #category : #accessing }
Scholarship >> type [
	^ type
]

{ #category : #accessing }
Scholarship >> type: anObject [
	type := anObject
]
