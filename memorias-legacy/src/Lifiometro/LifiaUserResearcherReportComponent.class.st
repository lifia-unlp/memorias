Class {
	#name : #LifiaUserResearcherReportComponent,
	#superclass : #ResearcherReportComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #rendering }
LifiaUserResearcherReportComponent >> fetchReport [

	| lifian |
	lifian := self session currentUser lifian.
	lifian ifNil: [ ^ nil ].
	^ LifiometroRepository singleton reportForResearcher: lifian
]

{ #category : #rendering }
LifiaUserResearcherReportComponent >> renderHeaderOn: html [

]
