Class {
	#name : #RawreferenceTest,
	#superclass : #TestCase,
	#category : #'Lifiometro-Model'
}

{ #category : #tests }
RawreferenceTest >> testBibtexPrintString [

	| ref apaReference parsedBibtexRef |
	apaReference := 'Abumrad, J., & Krulwich, R. (Hosts). (2018, February 14). Smarty plants [Audio podcast episode]. In Radiolab. WNYC.'.
	ref := RawReference new.
	ref reference: apaReference.

	parsedBibtexRef := PPBibtexParser new parse: ref bibtexPrintString.
	self assert: (parsedBibtexRef first at: 'note') equals: apaReference.

	ref year: '2018'.
	parsedBibtexRef := PPBibtexParser new parse: ref bibtexPrintString.
	self assert: parsedBibtexRef first citationKey equals: 'raw2018'.
	self assert: parsedBibtexRef first year equals: 2018.
	self assert: (parsedBibtexRef first at: 'note') equals: apaReference.
	
   self assert: (parsedBibtexRef first tags collect: #name) asSet equals: (Set with: 'year' with: 'note' ).
]
