Class {
	#name : #SimpleListReportComponent,
	#superclass : #ReportComponent,
	#instVars : [
		'sections'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #initialization }
SimpleListReportComponent >> addSectionTitled: aString with: aCollection [
	sections add: aString -> aCollection

]

{ #category : #initialization }
SimpleListReportComponent >> initialize [ 	
	super initialize .
	sections := OrderedCollection new. 
	self prepareSections.
]

{ #category : #initialization }
SimpleListReportComponent >> prepareSections [
	"send addSectionTitled:with: as necessary "

	^ self subclassResponsibility
]

{ #category : #initialization }
SimpleListReportComponent >> renderContentOn: html [
	html div
		id: #page;
		with: [ self renderHeaderOn: html.
			self renderSectionsOn: html ]
]

{ #category : #initialization }
SimpleListReportComponent >> renderHeaderOn: html [
	html image
		width: 149;
		url: LifiaFileLibrary / #logolifiaPng.
	html break.
	html heading: self reportTitle
]

{ #category : #initialization }
SimpleListReportComponent >> renderItem: item on: html [
  self subclassResponsibility 
]

{ #category : #initialization }
SimpleListReportComponent >> renderSectionsOn: html [
	sections
		do: [ :section | 
			html heading level2 with: section key.
			section value do: [ :item | self renderItem: item on: html ] ]
]

{ #category : #initialization }
SimpleListReportComponent >> reportTitle [

   self subclassResponsibility 
]

{ #category : #initialization }
SimpleListReportComponent >> style [
	^ '

body {
    font-family: "Libre Franklin",sans-serif;
    font-size: 1.5rem;
	 color: #404040;
    line-height: 1.75;
}

h1 { 
    font-weight: 400;
    font-size: 3.2rem;
    line-height: 1.25;
    font-style: normal;
}

h1, h2, label {
    font-family: "Libre Franklin",sans-serif;
    color: #004061;
}

h2 {
    font-size: 2.5rem;
}

#page {
    background: #fff;
    margin-left: auto;
    margin-right: auto;
    max-width: 1140px;
    padding: 3.0303%;
}

table tbody th, table td {
   border-bottom: solid 1px;
	font-size: .85em;
	padding: 8px;
}

p { 
   margin: 0 0 15px;
}

a { 
    text-decoration: underline;
    color: #117bb8;
    transition: .1s all ease-in;
}

'
]

{ #category : #initialization }
SimpleListReportComponent >> updateRoot: aWARoot [
	super updateRoot: aWARoot.
	aWARoot title: 'LIFIA - ' , self reportTitle
]
