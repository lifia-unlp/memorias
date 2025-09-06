Class {
	#name : #JsonLDWriter,
	#superclass : #Object,
	#category : #'Lifiometro-Linked-Data'
}

{ #category : #'env-vars' }
JsonLDWriter >> configuration [
	^ LifiometroRepository singleton persistentConfiguration linkedDataConfiguration 
]

{ #category : #urls }
JsonLDWriter >> dataUrl [

	^ self configuration  dataUrl
]

{ #category : #json }
JsonLDWriter >> json [

	| lifians publications |
	lifians := LifiometroRepository singleton lifians collect: [ :each |
		           self researcherAsDictionary: each ].


	publications := LifiometroRepository singleton references collect: [
		                :each | self publicationAsDictionary: each ].


	^ STONJSON toStringPretty:
		  ({ self lifiaAsDictionary } , lifians , publications) asArray
]

{ #category : #writing }
JsonLDWriter >> lifiaAsDictionary [
	^ Dictionary new
		at: '@type' put: 'Organization';
		at: 'name' put: self configuration organizationName;
		at: '@id' put: self configuration organizationUrl ;
		at: 'ulr'  put: self configuration organizationUrl ;
		yourself
]

{ #category : #writing }
JsonLDWriter >> publicationAsDictionary: aPublication [

	| dict |
	dict := Dictionary new.
	dict at: '@type' put: 'ScholarlyArticle'.
	dict at: '@id' put: (self urlForArticle: aPublication).
	aPublication selfArchivingUrl ifNotNil: [ :it |
		dict at: 'url' put: it ].
	dict at: '@id' put: (self urlForArticle: aPublication).
	dict at: 'description' put: aPublication asSummary.
	dict at: 'datePublished' put: aPublication year.
	dict
		at: 'author'
		put: (aPublication relatedLifians collect: [ :lifian |
				 Dictionary new
					 at: '@id' put: (self urlForResearcher: lifian);
					 yourself ]) asArray.
	^ dict
]

{ #category : #writing }
JsonLDWriter >> researcherAsDictionary: aResearcher [

	| dict |
	dict := Dictionary new
		        at: '@context' put: 'https://schema.org';
		        at: '@type' put: 'Person';
		        at: '@id' put: (self urlForResearcher: aResearcher);
		        at: 'affiliation' put: (Dictionary new
				         at: '@id' put: self configuration organizationUrl;
				         yourself);
		        at: 'email' put: aResearcher institutionalEmail;
		        at: 'givenName' put: aResearcher firstName;
		        at: 'familyName' put: aResearcher lastName;
		        yourself.

	aResearcher orcid ifNotNilNotEmpty: [ :it |
		dict at: 'identifier' put: (Dictionary new
				 at: 'type' put: 'PropertyValue';
				 at: 'propertyID' put: 'orcid';
				 at: 'value' put: (it copyWithoutAll: 'https://orcid.org/');
				 yourself) ].

	^ dict
]

{ #category : #urls }
JsonLDWriter >> urlForArticle: aPublication [

	^ self dataUrl , 'publication/' , aPublication slug
]

{ #category : #urls }
JsonLDWriter >> urlForResearcher: aResearcher [

	^ self dataUrl , 'researcher/' , aResearcher slug
]
