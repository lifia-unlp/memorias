Class {
	#name : #PeriodBoundedEntry,
	#superclass : #LifiaLogEntry,
	#instVars : [
		'endDate',
		'startDate'
	],
	#category : 'Lifiometro-Model'
}

{ #category : #accessing }
PeriodBoundedEntry >> endDate [
	"Mongo converted this as DateAndTime"

	^ endDate ifNotNil: [ endDate asDate ]
]

{ #category : #accessing }
PeriodBoundedEntry >> endDate: anObject [
	endDate := anObject
]

{ #category : #accessing }
PeriodBoundedEntry >> startDate [
	"Mongo converted this as DateAndTime"

	^ startDate ifNotNil: [ startDate asDate ]
]

{ #category : #accessing }
PeriodBoundedEntry >> startDate: anObject [
	startDate := anObject
]
