Class {
	#name : #PublicReportComponent,
	#superclass : #WAComponent,
	#category : 'Lifiometro-Reports'
}

{ #category : #'rendering-projects' }
PublicReportComponent >> urlForProjectProfile: each [
	^ '/project-profile?vid=' , each voyageId printString
]

{ #category : #'rendering-researchers' }
PublicReportComponent >> urlForResearcherProfile: each [
	^ '/researcher-profile?vid=' , each voyageId printString
]
