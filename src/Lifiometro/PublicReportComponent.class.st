Class {
	#name : #PublicReportComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #'as yet unclassified' }
PublicReportComponent >> jsonLDDictionary [
	^ self subclassResponsibility 
]

{ #category : #accessing }
PublicReportComponent >> title [
	^ self subclassResponsibility
]

{ #category : #'as yet unclassified' }
PublicReportComponent >> updateRoot: aWARoot [
	super updateRoot: aWARoot.
	aWARoot title: self title.
	aWARoot javascript
		type: 'application/json+ld';
		with:
			(JSStream
				on:
					(String
						streamContents: [ :stream | 
							(NeoJSONWriter on: stream)
								prettyPrint: true;
								nextPut: self jsonLDDictionary ]))
]
