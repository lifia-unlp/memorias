Class {
	#name : #JsonLDWriter2,
	#superclass : #Object,
	#category : #'Lifiometro-Reports'
}

{ #category : #writing }
JsonLDWriter2 >> lifiaAsDictionary [
	^ Dictionary new
		at: '@type' put: 'Organization';
		at: '@id' put: 'main-organization';
		at: 'name' put: 'Centro de Investigación LIFIA';
		at: 'url' put: 'http://www.lifia.info.unlp.edu.ar/';
		yourself
]

{ #category : #writing }
JsonLDWriter2 >> writeResearcherReport: aResearcherReport [ 
	| mapper |
	mapper := NeoJSONWriter new.
	
	mapper for: ResearcherReport do: [ :mapping | 
		mapping mapProperty: '@context' getter: [ :report | 'https://schema.org' ] setter: nil.
		mapping mapProperty: '@graph' getter: [ :report |
			OrderedCollection
				with: report researcher
			 ] setter: nil. 
		 ].
	
	mapper for: Lifian do: [ :mapping | 
		mapping mapProperty: '@type' getter: [ :lifian | 'Person' ] setter: nil. 
		mapping mapProperty: '@id' getter: [ :lifian | lifian voyageId printString ] setter: nil.
		mapping mapInstVar: #firstName to: 'givenName'.
		mapping mapInstVar: #lastName to: 'familyName'.
		mapping mapProperty: 'affiliation' getter: [ :lifian | self lifiaAsDictionary ] setter: nil.
		" This should be done using the #mapAccessor message, but it didn't work for some reason "
		mapping mapProperty: 'contactPoints' getter: [ :lifian | lifian contactPoints ] setter: nil.
		mapping mapInstVar: #institutionalEmail to: 'email'.
		(mapping mapInstVar: #highestDegree to: 'hasCredential') valueSchema: #credential. 
		"(mapping mapProperty: 'hasCredential' getter: [ :lifian | lifian highestDegree ] setter: nil) valueSchema: #credential." ].
	
	mapper for: #credential do: [ :mapping | 
		mapping mapProperty: '@type' getter: [ :degree | 'EducationalOccupationalCredential' ] setter: nil.
		mapping mapProperty: 'name' getter: [ :degree | degree ] setter: nil. ].
	
	mapper for: ContactPoint do: [ :mapping | 
		mapping mapProperty: '@type' getter: [ :elem | 'ContactPoint' ] setter: nil.
		mapping mapInstVars. ].
	
  ^ String
		streamContents: [ :stream | mapper on: stream; nextPut: aResearcherReport ]
]
