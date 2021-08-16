export
asJsonLD
	| researcherDict writer |
	writer := JsonLDWriter new.
	researcherDict := writer researcherAsDictionary: researcher.
	researcherDict at: 'affiliation' put: writer lifiaAsDictionary.
	researcherDict
		at: 'http://xmlns.com/foaf/0.1/publications'
		put:
			(publications
				collect: [ :each | writer publicationAsDictionary: each ]).
	^ String
		streamContents: [ :stream | 
			(NeoJSONWriter on: stream)
				prettyPrint: true;
				nextPut: researcherDict ]