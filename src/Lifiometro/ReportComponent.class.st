Class {
	#name : #ReportComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #'rendering-projects' }
ReportComponent >> sortDescencingByEndDate: periodBoundedEntities [
	"If endDate is nil, assume it is still running and therefore comes first, sorted by start date"

	^ periodBoundedEntities asSortedCollection: [ :a :b |
		  a endDate isNil
			  ifTrue: [
				  b endDate isNil
					  ifTrue: [ a startDate >= b startDate ]
					  ifFalse: [ true ] ]
			  ifFalse: [
				  b endDate isNil
					  ifTrue: [ false ]
					  ifFalse: [ a endDate >= b endDate ] ] ]
]
