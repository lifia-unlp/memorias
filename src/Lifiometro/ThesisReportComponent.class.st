Class {
	#name : #ThesisReportComponent,
	#superclass : #ProfileReportComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #urls }
ThesisReportComponent class >> relativeUrl [
	^ 'thesis-profile'
]

{ #category : #urls }
ThesisReportComponent class >> relativeUrlFor: item [
	^ 'thesis-profile?vid=' , item voyageId printString
]

{ #category : #rendering }
ThesisReportComponent >> renderContentOn: html [
	
]
