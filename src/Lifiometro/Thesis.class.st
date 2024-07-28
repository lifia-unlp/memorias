Class {
	#name : #Thesis,
	#superclass : #PeriodBoundedEntry,
	#instVars : [
		'career',
		'title',
		'director',
		'coDirector',
		'otherAdvisors',
		'level',
		'student',
		'summary',
		'selfArchivingUrl',
		'progress',
		'keywords',
		'website'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #testing }
Thesis class >> isVoyageRoot [
	^ true 
]

{ #category : #accessing }
Thesis >> career [
	^ career
]

{ #category : #accessing }
Thesis >> career: anObject [
	career := anObject
]

{ #category : #accessing }
Thesis >> coDirector [
	^ coDirector
]

{ #category : #accessing }
Thesis >> coDirector: anObject [
	coDirector := anObject
]

{ #category : #accessing }
Thesis >> director [
	^ director
]

{ #category : #accessing }
Thesis >> director: anObject [
	director := anObject
]

{ #category : #accessing }
Thesis >> keywords [
	^ keywords
]

{ #category : #accessing }
Thesis >> keywords: anObject [
	keywords := anObject
]

{ #category : #accessing }
Thesis >> level [
	^ level
]

{ #category : #accessing }
Thesis >> level: anObject [
	level := anObject
]

{ #category : #accessing }
Thesis >> otherAdvisors [
	^ otherAdvisors
]

{ #category : #accessing }
Thesis >> otherAdvisors: anObject [
	otherAdvisors := anObject
]

{ #category : #accessing }
Thesis >> progress [
	^ progress
]

{ #category : #accessing }
Thesis >> progress: anObject [
	progress := anObject
]

{ #category : #accessing }
Thesis >> propertyNames [
	^ {'student' . 'title' . 'career' . 'level' . 'startDate' . 'endDate'.
	'director' . 'coDirector' . 'otherAdvisors' . 'summary' . 'relatedLifians'.
	'relatedProjects' . 'selfArchivingUrl' . 'progress' . 'keywords'. 'website'}
]

{ #category : #'double dispatch' }
Thesis >> renderAsNewsSubjectWith: aRenderer on: aCanvas [
	aRenderer renderThesis: self on: aCanvas 
]

{ #category : #accessing }
Thesis >> selfArchivingUrl [
	^ selfArchivingUrl
]

{ #category : #accessing }
Thesis >> selfArchivingUrl: anObject [
	selfArchivingUrl := anObject
]

{ #category : #accessing }
Thesis >> student [
	^ student
]

{ #category : #accessing }
Thesis >> student: anObject [
	student := anObject
]

{ #category : #accessing }
Thesis >> summary [
	^ summary
]

{ #category : #accessing }
Thesis >> summary: anObject [
	summary := anObject
]

{ #category : #accessing }
Thesis >> title [
	^ title
]

{ #category : #accessing }
Thesis >> title: anObject [
	title := anObject
]

{ #category : #accessing }
Thesis >> website [
	^ website
]

{ #category : #accessing }
Thesis >> website: anObject [
	website := anObject
]
