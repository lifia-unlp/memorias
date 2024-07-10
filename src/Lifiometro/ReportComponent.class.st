Class {
	#name : #ReportComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #'rendering-projects' }
ReportComponent >> asSortedProjects: aCollecttionOfProjects [

	^ aCollecttionOfProjects asSortedCollection: [ :a :b |
		  a endDate >= b endDate ]
]
