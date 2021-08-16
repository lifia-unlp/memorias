Class {
	#name : #ScheduleItem,
	#superclass : #PeriodBoundedEntry,
	#instVars : [
		'title',
		'notes',
		'type',
		'moreInfoUrl'
	],
	#category : 'Lifiometro-Model'
}

{ #category : #testing }
ScheduleItem class >> isVoyageRoot [
	^ true 
]

{ #category : #initialization }
ScheduleItem >> initialize [
	super initialize.
	excludeFromReports := true
]

{ #category : #accessing }
ScheduleItem >> moreInfoUrl [
	^ moreInfoUrl
]

{ #category : #accessing }
ScheduleItem >> moreInfoUrl: anObject [
	moreInfoUrl := anObject
]

{ #category : #accessing }
ScheduleItem >> notes [
	^ notes
]

{ #category : #accessing }
ScheduleItem >> notes: anObject [
	notes := anObject
]

{ #category : #accessing }
ScheduleItem >> propertyNames [
	^ {'title' . 'startDate' . 'endDate' . 'notes' . 'type' . 'moreInfoUrl'.
	'excludeFromReports'. . 'relatedLifians'}
]

{ #category : #accessing }
ScheduleItem >> title [
	^ title
]

{ #category : #accessing }
ScheduleItem >> title: anObject [
	title := anObject
]

{ #category : #accessing }
ScheduleItem >> type [
	^ type
]

{ #category : #accessing }
ScheduleItem >> type: anObject [
	type := anObject
]
