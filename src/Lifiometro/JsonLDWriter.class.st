Class {
	#name : #JsonLDWriter,
	#superclass : #Object,
	#category : 'Lifiometro-Reports'
}

{ #category : #writing }
JsonLDWriter >> lifiaAsDictionary [
	^ Dictionary new
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'Organization';
		at: 'name' put: 'Centro de Investigación LIFIA';
		at: 'url' put: 'http://www.lifia.info.unlp.edu.ar/';
		yourself
]

{ #category : #writing }
JsonLDWriter >> publicationAsDictionary: aPublication [
	| dict |
	dict := Dictionary new.
	dict
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'ScholarlyArticle'.
	aPublication selfArchivingUrl
		ifNotNil: [ :it | dict at: 'url' put: it ].
	dict at: 'description' put: aPublication asSummary.
	^ dict
]

{ #category : #writing }
JsonLDWriter >> researcherAsDictionary: aResearcher [
	^ Dictionary new
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'Person';
		at: 'url'
			put:
			'http://memorias.lifia.info.unlp.edu.ar/researcher/'
				, aResearcher institutionalEmail;
		at: 'email' put: aResearcher institutionalEmail;
		at: 'givenName' put: aResearcher firstName;
		at: 'familyName' put: aResearcher lastName;
		yourself
]
