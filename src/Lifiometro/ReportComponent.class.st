Class {
	#name : #ReportComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #'rendering-projects' }
ReportComponent >> baseUrl [

	Transcript show: self requestContext request url; cr.


	^ '/'
]

{ #category : #actions }
ReportComponent >> exportBibtex [

	| bibtexEntries |
	bibtexEntries := self report allPublications.
	self requestContext respond: [ :response |
		response contentType: 'application/x-bibtex'.
		response
			headerAt: 'Content-Disposition'
			put: 'attachment; filename="publications.bib"'.
		response nextPutAll: (String streamContents: [ :stream |
				 bibtexEntries do: [ :each |
					 stream
						 nextPutAll: each bibtexPrintString;
						 cr;
						 cr ] ]) ]
]

{ #category : #rendering }
ReportComponent >> renderElementsSelectedBy: elementSelectionBlock labeled: label with: aRenderingBlock on: html [

	| elements |
	elements := elementSelectionBlock value
		            ifEmpty: [ ^ self ]
		            ifNotEmpty: [ :value |
		            self
			            sortDescencingByEndDate: value
			            separateFinished: true ].
	html heading level2 with: label.
	(elements at: 'inProgress' ifAbsent: [ Set new ]) ifNotEmpty: [
		:elems |
		html paragraph: [ html strong: 'En curso' ].
		elems do: [ :each | aRenderingBlock value: each value: html ] ].

	(elements at: 'finished' ifAbsent: [ Set new ]) ifNotEmpty: [ :elems |
		html paragraph: [ html strong: 'Concluídos' ].
		elems do: [ :each | aRenderingBlock value: each value: html ] ]
]

{ #category : #reporting }
ReportComponent >> report [

	^ self subclassResponsibility
]

{ #category : #'rendering-projects' }
ReportComponent >> sortDescencingByEndDate: periodBoundedEntities [
	"If endDate is nil, assume it is still running and therefore comes first, sorted by start date"

	^ self
		  sortDescencingByEndDate: periodBoundedEntities
		  separateFinished: false
]

{ #category : #'rendering-projects' }
ReportComponent >> sortDescencingByEndDate: periodBoundedEntities separateFinished: separateFinished [
        "If endDate is nil, assume it is still running and therefore comes first, sorted by start date"

	| sorted |
	sorted := periodBoundedEntities asSortedCollection: [ :a :b |
		          a endDate isNil
			          ifTrue: [
				          b endDate isNil
					          ifTrue: [ a startDate >= b startDate ]
					          ifFalse: [ true ] ]
			          ifFalse: [
				          b endDate isNil
					          ifTrue: [ false ]
					          ifFalse: [ a endDate >= b endDate ] ] ].
	^ separateFinished
		  ifTrue: [
			  sorted groupedBy: [ :each |
				  each isActive
					  ifTrue: [ 'inProgress' ]
					  ifFalse: [ 'finished' ] ] ]
                  ifFalse: [ sorted ]
]
