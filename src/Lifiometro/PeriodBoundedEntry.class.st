Class {
	#name : #PeriodBoundedEntry,
	#superclass : #LifiaLogEntry,
	#instVars : [
		'endDate',
		'startDate'
	],
	#category : #'Lifiometro-Model'
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
PeriodBoundedEntry >> endYear [
	"Mongo converted this as DateAndTime"

	^ self endDate ifNotNil: [ :it | it year ]
]

{ #category : #testing }
PeriodBoundedEntry >> isActive [
	^ endDate isNil or: [ endDate > Date today ]
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

{ #category : #accessing }
PeriodBoundedEntry >> suggestSlugBase [
	^super suggestSlugBase , '-', startDate year printString
]
